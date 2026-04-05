// controllers/orderController.js
import pool from "../config/db.js";
import { ensureOrderPaymentSchema } from "../lib/orderSchema.js";
import {
  createOrUpdatePaymentRecord,
  expirePendingPayments,
  getPaymentByOrderId,
  reconcilePaymentsForOrders,
  refundOrderPayment,
} from "../lib/paymentLedger.js";
import { ensurePaymentSchema } from "../lib/paymentSchema.js";

const ALLOWED_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

const expirePendingPaymentOrders = async () => {
  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    await expirePendingPayments(pool);
  } catch (err) {
    console.error("Failed to expire pending payment orders:", err);
  }
};

/* ============================
   🧾 Create a New Order (User)
   Uses: create_order_with_items()
=============================== */
export const createOrder = async (req, res) => {
  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    const { items, payment_mode = "UPI", pickup_time = null } = req.body;
    const user_id = req.user.user_id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Items required" });

    const invalidItem = items.find(
      (item) => !Number.isInteger(item.item_id) || !Number.isInteger(item.quantity) || item.quantity <= 0
    );
    if (invalidItem) {
      return res.status(400).json({ message: "Each order item needs a valid item_id and quantity" });
    }

    const mergedItems = Array.from(
      items.reduce((map, item) => {
        const existing = map.get(item.item_id);
        map.set(item.item_id, {
          item_id: item.item_id,
          quantity: (existing?.quantity || 0) + item.quantity,
        });
        return map;
      }, new Map()).values()
    );

    const itemIds = mergedItems.map((item) => item.item_id);
    const placeholders = itemIds.map(() => "?").join(", ");
    const [menuItems] = await pool.query(
      `SELECT 
        m.item_id,
        m.name,
        m.availability
      FROM Menu m
      WHERE m.item_id IN (${placeholders})`,
      itemIds
    );

    const menuMap = new Map(menuItems.map((item) => [item.item_id, item]));
    for (const item of mergedItems) {
      const currentItem = menuMap.get(item.item_id);
      if (!currentItem) {
        return res.status(404).json({ message: `Item ${item.item_id} was not found` });
      }

      if (!currentItem.availability) {
        return res.status(400).json({ message: `${currentItem.name} is currently unavailable` });
      }
    }

    // Convert items array to JSON string for SQL procedure
    const itemsJson = JSON.stringify(mergedItems);

    // ⚡ Call stored procedure to handle everything atomically
    const [resultSets] = await pool.query(
      "CALL create_order_with_items(?, ?, ?, ?)",
      [user_id, payment_mode, pickup_time, itemsJson]
    );

    // The first result set contains the returned order info
    const orderInfo = resultSets[0]?.[0];

    if (orderInfo?.order_id) {
      await pool.query(
        `UPDATE Orders
         SET payment_status = 'paid',
             payment_verified_at = NOW(),
             status = 'preparing'
         WHERE order_id = ?`,
        [orderInfo.order_id]
      );

      await createOrUpdatePaymentRecord(pool, {
        orderId: orderInfo.order_id,
        userId: user_id,
        provider: "manual",
        amount: orderInfo.amount,
        currency: "INR",
        status: "paid",
        refundStatus: "none",
        verifiedAt: new Date(),
      });
    }

    res.status(201).json({
      message: "Order placed successfully ✅",
      order_id: orderInfo?.order_id,
      order_no: orderInfo?.order_no,
      amount: orderInfo?.amount,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};

/* ============================
   📦 Get Order by ID
=============================== */
export const getOrderById = async (req, res) => {
  try {
    await ensurePaymentSchema();
    const [order] = await pool.query(
      `SELECT 
        o.*,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        NULL AS customer_address,
        COALESCE(p.status, o.payment_status, 'paid') AS payment_status,
        COALESCE(p.refund_status, 'none') AS refund_status,
        p.refund_id,
        p.refund_amount,
        p.refund_failure_reason,
        p.refunded_at
      FROM Orders o
      JOIN User u ON o.user_id = u.user_id
      LEFT JOIN Payments p ON p.order_id = o.order_id
      WHERE o.order_id = ?`,
      [req.params.id]
    );

    if (!order.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const resolvedPaymentStatus = order[0].payment_status || "paid";
    if (req.user.role !== "customer" && resolvedPaymentStatus !== "paid") {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "customer" && order[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only access your own orders" });
    }

    const [items] = await pool.query(
      `SELECT 
        oi.item_id,
        COALESCE(m.name, CONCAT('Item #', oi.item_id)) AS name,
        oi.quantity,
        COALESCE(m.cost, 0) AS cost
       FROM OrderItem oi 
       LEFT JOIN Menu m ON oi.item_id = m.item_id 
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ order: order[0], items });
  } catch (err) {
    console.error("❌ Error fetching order by ID:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ============================
   🧍‍♂️ Get All Orders for Admin
   Uses: get_orders_by_date()
=============================== */
export const getAllOrders = async (req, res) => {
  try {
    await expirePendingPaymentOrders();
    // 🗓️ Filter by date or default to today
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const date = req.query.date || today;

    const [candidateOrders] = await pool.query(
      `SELECT o.order_id
       FROM Orders o
       JOIN Payments p ON p.order_id = o.order_id
       WHERE DATE(o.order_date) = ?
         AND p.provider = 'razorpay'
         AND p.status IN ('pending', 'failed', 'cancelled')`,
      [date]
    );

    await reconcilePaymentsForOrders(
      pool,
      candidateOrders.map((order) => order.order_id)
    );

    const [orders] = await pool.query(
      `SELECT
        o.order_id,
        o.order_no,
        o.user_id,
        u.name AS customer_name,
        o.amount,
        o.status,
        COALESCE(p.status, o.payment_status, 'paid') AS payment_status,
        COALESCE(p.refund_status, 'none') AS refund_status,
        p.refund_id,
        o.payment_mode,
        o.order_date
      FROM Orders o
      JOIN User u ON o.user_id = u.user_id
      LEFT JOIN Payments p ON p.order_id = o.order_id
      WHERE DATE(o.order_date) = ?
        AND COALESCE(p.status, o.payment_status, 'paid') = 'paid'
      ORDER BY o.order_no ASC`,
      [date]
    );

    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(o.amount), 0) AS totalRevenue
       FROM Orders o
       LEFT JOIN Payments p ON p.order_id = o.order_id
       WHERE DATE(o.order_date) = ?
         AND COALESCE(p.status, o.payment_status, 'paid') = 'paid'
         AND COALESCE(p.refund_status, 'none') <> 'processed'`,
      [date]
    );

    res.json({ date, totalRevenue, orders });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ============================
   🔄 Update Order Status (Admin)
   Uses: update_order_status()
=============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    await ensurePaymentSchema();
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    // ⚡ Use stored procedure to ensure valid transitions
    await pool.query("CALL update_order_status(?, ?)", [id, status]);

    let refundResult = null;
    if (status === "cancelled") {
      const payment = await getPaymentByOrderId(pool, id);
      if (payment?.status === "paid") {
        refundResult = await refundOrderPayment({
          orderId: Number(id),
          reason: "Order cancelled by operations",
          initiatedBy: req.user.role,
        });
      }
    }

    res.json({
      message:
        refundResult?.code === "refunded"
          ? "Order status updated and refund processed successfully ✅"
          : "Order status updated successfully ✅",
      refund: refundResult,
    });
  } catch (err) {
    console.error("❌ Error updating order status:", err);

    if (err.sqlState === "45000" || err.code === "ER_SIGNAL_EXCEPTION") {
      return res.status(400).json({ message: err.sqlMessage || "Invalid order status transition" });
    }

    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* ============================
   👤 Get Orders for Logged-In User
   Uses: get_user_orders()
=============================== */
export const getUserOrders = async (req, res) => {
  try {
    await expirePendingPaymentOrders();
    const user_id = req.user.user_id;

    const [candidateOrders] = await pool.query(
      `SELECT o.order_id
       FROM Orders o
       JOIN Payments p ON p.order_id = o.order_id
       WHERE o.user_id = ?
         AND p.provider = 'razorpay'
         AND p.status IN ('pending', 'failed', 'cancelled')`,
      [user_id]
    );

    await reconcilePaymentsForOrders(
      pool,
      candidateOrders.map((order) => order.order_id)
    );

    const [orders] = await pool.query(
      `SELECT 
        o.order_id,
        o.order_no,
        o.amount,
        o.payment_mode,
        COALESCE(p.status, o.payment_status, 'paid') AS payment_status,
        COALESCE(p.refund_status, 'none') AS refund_status,
        p.refund_id,
        p.refund_amount,
        p.refund_failure_reason,
        p.refunded_at,
        o.status,
        o.order_date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'item_id', oi.item_id,
            'name', COALESCE(m.name, CONCAT('Item #', oi.item_id)),
            'quantity', oi.quantity
          )
        ) AS items
      FROM Orders o
      LEFT JOIN Payments p ON p.order_id = o.order_id
      JOIN OrderItem oi ON o.order_id = oi.order_id
      LEFT JOIN Menu m ON oi.item_id = m.item_id
      WHERE o.user_id = ?
      GROUP BY
        o.order_id,
        o.order_no,
        o.amount,
        o.payment_mode,
        p.status,
        p.refund_status,
        p.refund_id,
        p.refund_amount,
        p.refund_failure_reason,
        p.refunded_at,
        o.payment_status,
        o.status,
        o.order_date
      ORDER BY o.order_date DESC`,
      [user_id]
    );

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json([]);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params; // order_id

    await ensurePaymentSchema();

    const [orders] = await pool.query(
      "SELECT order_id, user_id, status FROM Orders WHERE order_id = ?",
      [id]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orders[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only cancel your own orders" });
    }

    await pool.query("CALL cancel_order(?)", [id]);

    let refundResult = null;
    const payment = await getPaymentByOrderId(pool, id);
    if (payment?.status === "paid") {
      refundResult = await refundOrderPayment({
        orderId: Number(id),
        reason: "Order cancelled by customer",
        initiatedBy: req.user.role,
      });
    }

    res.json({
      message:
        refundResult?.code === "refunded"
          ? "Order cancelled and refund processed successfully ✅"
          : "Order cancelled successfully ✅",
      refund: refundResult,
    });
  } catch (err) {
    console.error("❌ Error cancelling order:", err);

    if (err.sqlState === "45000" || err.code === "ER_SIGNAL_EXCEPTION") {
      return res.status(400).json({ message: err.sqlMessage });
    }

    res.status(500).json({ message: "Failed to cancel order" });
  }
};
