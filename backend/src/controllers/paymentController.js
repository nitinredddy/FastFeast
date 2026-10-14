import crypto from "crypto";
import pool from "../config/db.js";
import { getBusinessSettings } from "../lib/appSettings.js";
import { ensureOrderPaymentSchema } from "../lib/orderSchema.js";
import {
  createOrUpdatePaymentRecord,
  expirePendingPayments,
  getPaymentByOrderId,
  getPaymentByProviderOrderId,
  markPaymentState,
  refundOrderPayment,
} from "../lib/paymentLedger.js";
import { ensurePaymentSchema } from "../lib/paymentSchema.js";
import { getRazorpayClient } from "../lib/razorpay.js";

const PAYMENT_TIMEOUT_MINUTES = Number(process.env.PAYMENT_TIMEOUT_MINUTES || 15);

const mergeItems = (items) =>
  Array.from(
    items.reduce((map, item) => {
      const existing = map.get(item.item_id);
      map.set(item.item_id, {
        item_id: item.item_id,
        quantity: (existing?.quantity || 0) + item.quantity,
      });
      return map;
    }, new Map()).values()
  );

const validateCanteenOpen = () => {
  return null;
};

const validateBusinessState = async () => {
  const settings = await getBusinessSettings();

  if (!settings.ordering_enabled) {
    return "The canteen is currently closed.";
  }

  if (!settings.payments_enabled) {
    return "Online payments are temporarily unavailable.";
  }

  const startHour = Number(settings.open_hour_start);
  const endHour = Number(settings.open_hour_end);

  const now = new Date();
  const istTime = new Intl.DateTimeFormat("en-IN", {
   timeZone: "Asia/Kolkata",
   hour: "2-digit",
   minute: "2-digit",
   hour12: false,
  }).formatToParts(now);

  const hour = Number(istTime.find((part) => part.type === "hour").value);
  const minute = Number(istTime.find((part) => part.type === "minute").value);

  const currentHour = hour + minute / 60;
  const isOpen =
    startHour < endHour
      ? currentHour >= startHour && currentHour < endHour
      : currentHour >= startHour || currentHour < endHour;

  return isOpen ? null : "The canteen is outside ordering hours.";
};

const markOrderAsFailed = async (executor, orderId, reason, paymentStatus = "failed") => {
  await markPaymentState(executor, {
    orderId,
    paymentStatus,
    failureReason: reason,
    verified: false,
  });
};

export const createPaymentOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    await expirePendingPayments(connection);

    const canteenStateError = await validateBusinessState();
    if (canteenStateError) {
      return res.status(400).json({ message: canteenStateError });
    }

    const userId = req.user.user_id;
    const canteenId = Number(req.body.canteen_id || 1);
    const pickupTime = req.body.pickup_time || null;
    const items = mergeItems(req.body.items);

    await connection.beginTransaction();

    const itemIds = items.map((item) => item.item_id);
    const placeholders = itemIds.map(() => "?").join(", ");
    const [menuItems] = await connection.query(
      `SELECT item_id, name, cost, availability
       FROM Menu
       WHERE item_id IN (${placeholders})`,
      itemIds
    );

    const menuMap = new Map(menuItems.map((item) => [item.item_id, item]));
    for (const item of items) {
      const currentItem = menuMap.get(item.item_id);
      if (!currentItem) {
        await connection.rollback();
        return res.status(404).json({ message: `Item ${item.item_id} was not found` });
      }

      if (!currentItem.availability) {
        await connection.rollback();
        return res.status(400).json({ message: `${currentItem.name} is currently unavailable` });
      }
    }

    const amount = items.reduce((sum, item) => {
      const menuItem = menuMap.get(item.item_id);
      return sum + Number(menuItem.cost) * item.quantity;
    }, 0);

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const [[{ next_order_no }]] = await connection.query(
      `SELECT COUNT(*) + 1 AS next_order_no
       FROM Orders
       WHERE DATE(order_date) = ?`,
      [today]
    );

    const [orderResult] = await connection.query(
      `INSERT INTO Orders (
        user_id,
        canteen_id,
        order_no,
        amount,
        payment_mode,
        pickup_time,
        status,
        payment_status,
        payment_expires_at
      ) VALUES (?, ?, ?, ?, 'Razorpay', ?, 'pending', 'pending', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [userId, canteenId, next_order_no, amount, pickupTime, PAYMENT_TIMEOUT_MINUTES]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        "INSERT INTO OrderItem (order_id, item_id, quantity) VALUES (?, ?, ?)",
        [orderId, item.item_id, item.quantity]
      );
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `ff_${orderId}_${Date.now()}`,
      notes: {
        internal_order_id: String(orderId),
        user_id: String(userId),
      },
    });

    await connection.query(
      "UPDATE Orders SET razorpay_order_id = ? WHERE order_id = ?",
      [razorpayOrder.id, orderId]
    );

    await createOrUpdatePaymentRecord(connection, {
      orderId,
      userId,
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
      amount,
      currency: razorpayOrder.currency,
      status: "pending",
      refundStatus: "none",
      expiresAt: new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000),
    });

    await connection.commit();

    res.status(201).json({
      message: "Payment order created successfully",
      order: {
        order_id: orderId,
        order_no: next_order_no,
        amount,
        status: "pending",
        payment_status: "pending",
      },
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "FastFeast",
        description: "Canteen preorder payment",
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Payment order creation error:", err);
    res.status(500).json({ message: err.message || "Failed to create payment order" });
  } finally {
    connection.release();
  }
};

export const verifyPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    await expirePendingPayments(connection);

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const payment = await getPaymentByProviderOrderId(connection, razorpay_order_id);

    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    if (payment.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You do not own this order" });
    }

    if (payment.status === "paid" || payment.status === "refunded") {
      return res.json({
        message: "Payment already verified",
        order_id: payment.order_id,
        status: payment.order_status,
      });
    }

    if (payment.expires_at && new Date(payment.expires_at) < new Date() && payment.status === "pending") {
      await markOrderAsFailed(connection, payment.order_id, "Payment timed out", "cancelled");
      return res.status(400).json({ message: "Payment session expired. Please try again." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await markOrderAsFailed(connection, payment.order_id, "Signature verification failed");
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await markPaymentState(connection, {
      orderId: payment.order_id,
      paymentStatus: "paid",
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature,
      failureReason: null,
      verified: true,
    });

    res.json({
      message: "Payment verified successfully",
      order_id: payment.order_id,
      status: "preparing",
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Failed to verify payment" });
  } finally {
    connection.release();
  }
};

export const markPaymentFailure = async (req, res) => {
  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    const { razorpay_order_id, reason = "Payment was not completed" } = req.body;

    const payment = await getPaymentByProviderOrderId(pool, razorpay_order_id);

    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    if (payment.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You do not own this order" });
    }

    if (payment.status === "paid" || payment.status === "refunded") {
      return res.status(400).json({ message: "Paid orders cannot be marked as failed" });
    }

    const paymentStatus = reason.toLowerCase().includes("close") ? "cancelled" : "failed";
    await markOrderAsFailed(pool, payment.order_id, reason, paymentStatus);

    res.json({ message: "Payment failure recorded" });
  } catch (err) {
    console.error("Payment failure handling error:", err);
    res.status(500).json({ message: "Failed to record payment failure" });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ message: "Webhook secret is not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.rawBody.toString("utf8"));
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.json({ received: true });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    const payment = await getPaymentByProviderOrderId(pool, razorpayOrderId);

    if (!payment) {
      return res.json({ received: true });
    }

    if (event === "payment.captured") {
      if (payment.status !== "paid" && payment.status !== "refunded") {
        await markPaymentState(pool, {
          orderId: payment.order_id,
          paymentStatus: "paid",
          providerPaymentId: razorpayPaymentId,
          failureReason: null,
          verified: true,
        });
      }
    }

    if (event === "payment.failed" && payment.status !== "paid" && payment.status !== "refunded") {
      await markOrderAsFailed(pool, payment.order_id, paymentEntity.error_description || "Payment failed via webhook");
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook handling error:", err);
    res.status(500).json({ message: "Failed to handle webhook" });
  }
};

export const refundPayment = async (req, res) => {
  try {
    await ensurePaymentSchema();
    await expirePendingPayments();

    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const payment = await getPaymentByOrderId(pool, orderId);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const result = await refundOrderPayment({
      orderId,
      reason: req.body?.reason || "Order cancelled",
      initiatedBy: req.user.role,
    });

    if (!result.ok && !["already_refunded", "refund_pending"].includes(result.code)) {
      return res.status(400).json({ message: result.message });
    }

    const refreshedPayment = await getPaymentByOrderId(pool, orderId);
    return res.json({
      message: result.message,
      payment_status: refreshedPayment?.status || payment.status,
      refund_status: refreshedPayment?.refund_status || payment.refund_status,
      refund_id: refreshedPayment?.refund_id || null,
    });
  } catch (err) {
    console.error("Refund handling error:", err);
    res.status(500).json({ message: err.message || "Failed to process refund" });
  }
};
