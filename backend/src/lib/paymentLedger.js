import pool from "../config/db.js";
import { getRazorpayClient } from "./razorpay.js";
import { ensurePaymentSchema } from "./paymentSchema.js";

export const expirePendingPayments = async (executor = pool) => {
  await ensurePaymentSchema();

  await executor.query(
    `UPDATE Payments
     SET status = 'cancelled',
         failure_reason = 'Payment timed out',
         refund_status = CASE WHEN refund_status IS NULL THEN 'none' ELSE refund_status END
     WHERE status = 'pending'
       AND provider_payment_id IS NULL
       AND expires_at IS NOT NULL
       AND expires_at < NOW()`
  );

  await executor.query(
    `UPDATE Orders o
     JOIN Payments p ON p.order_id = o.order_id
     SET o.payment_status = CASE
           WHEN p.status = 'refunded' THEN 'paid'
           ELSE p.status
         END,
         o.payment_failure_reason = p.failure_reason,
         o.payment_verified_at = p.verified_at,
         o.razorpay_order_id = COALESCE(p.provider_order_id, o.razorpay_order_id),
         o.razorpay_payment_id = COALESCE(p.provider_payment_id, o.razorpay_payment_id),
         o.razorpay_signature = COALESCE(p.provider_signature, o.razorpay_signature),
         o.payment_expires_at = p.expires_at,
         o.status = CASE
           WHEN p.status IN ('failed', 'cancelled') AND o.status = 'pending' THEN 'cancelled'
           ELSE o.status
         END`
  );
};

export const createOrUpdatePaymentRecord = async (executor, payment) => {
  await ensurePaymentSchema();

  await executor.query(
    `INSERT INTO Payments (
      order_id,
      user_id,
      provider,
      provider_order_id,
      provider_payment_id,
      provider_signature,
      amount,
      currency,
      status,
      refund_status,
      failure_reason,
      expires_at,
      verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      provider = VALUES(provider),
      provider_order_id = VALUES(provider_order_id),
      provider_payment_id = COALESCE(VALUES(provider_payment_id), provider_payment_id),
      provider_signature = COALESCE(VALUES(provider_signature), provider_signature),
      amount = VALUES(amount),
      currency = VALUES(currency),
      status = VALUES(status),
      refund_status = VALUES(refund_status),
      failure_reason = VALUES(failure_reason),
      expires_at = VALUES(expires_at),
      verified_at = VALUES(verified_at)`,
    [
      payment.orderId,
      payment.userId,
      payment.provider,
      payment.providerOrderId || null,
      payment.providerPaymentId || null,
      payment.providerSignature || null,
      payment.amount,
      payment.currency || "INR",
      payment.status,
      payment.refundStatus || "none",
      payment.failureReason || null,
      payment.expiresAt || null,
      payment.verifiedAt || null,
    ]
  );
};

export const markPaymentState = async (
  executor,
  { orderId, paymentStatus, failureReason = null, providerPaymentId = null, providerSignature = null, verified = false }
) => {
  await ensurePaymentSchema();

  const normalizedOrderPaymentStatus = paymentStatus === "refunded" ? "paid" : paymentStatus;

  await executor.query(
    `UPDATE Payments
     SET status = ?,
         provider_payment_id = COALESCE(?, provider_payment_id),
         provider_signature = COALESCE(?, provider_signature),
         failure_reason = ?,
         verified_at = CASE WHEN ? THEN NOW() ELSE verified_at END
     WHERE order_id = ?`,
    [paymentStatus, providerPaymentId, providerSignature, failureReason, verified, orderId]
  );

  await executor.query(
    `UPDATE Orders
     SET payment_status = ?,
         razorpay_payment_id = COALESCE(?, razorpay_payment_id),
         razorpay_signature = COALESCE(?, razorpay_signature),
         payment_failure_reason = ?,
         payment_verified_at = CASE WHEN ? THEN NOW() ELSE payment_verified_at END,
         status = CASE
           WHEN ? = 'paid' AND status = 'pending' THEN 'preparing'
           WHEN ? = 'paid'
             AND status = 'cancelled'
             AND payment_verified_at IS NULL
             AND COALESCE(payment_status, 'pending') IN ('pending', 'failed', 'cancelled')
             AND (
               payment_failure_reason IS NULL OR
               payment_failure_reason IN (
                 'Payment timed out',
                 'User closed the Razorpay checkout',
                 'Razorpay payment failed',
                 'Signature verification failed'
               )
             )
           THEN 'preparing'
           WHEN ? IN ('failed', 'cancelled') AND status = 'pending' THEN 'cancelled'
           ELSE status
         END
     WHERE order_id = ?`,
    [
      normalizedOrderPaymentStatus,
      providerPaymentId,
      providerSignature,
      failureReason,
      verified,
      paymentStatus,
      paymentStatus,
      paymentStatus,
      orderId,
    ]
  );
};

export const getPaymentByProviderOrderId = async (executor, providerOrderId) => {
  const [rows] = await executor.query(
    `SELECT p.*, o.status AS order_status, o.order_no
     FROM Payments p
     JOIN Orders o ON o.order_id = p.order_id
     WHERE p.provider_order_id = ?`,
    [providerOrderId]
  );

  return rows[0] || null;
};

export const getPaymentByOrderId = async (executor, orderId) => {
  const [rows] = await executor.query(
    `SELECT p.*, o.status AS order_status, o.order_no
     FROM Payments p
     JOIN Orders o ON o.order_id = p.order_id
     WHERE p.order_id = ?`,
    [orderId]
  );

  return rows[0] || null;
};

export const refundOrderPayment = async ({
  orderId,
  reason = "Order cancelled",
  initiatedBy = "system",
}) => {
  await ensurePaymentSchema();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
        p.payment_id,
        p.order_id,
        p.user_id,
        p.provider,
        p.provider_payment_id,
        p.amount,
        p.status,
        p.refund_status,
        p.refund_id,
        o.status AS order_status
       FROM Payments p
       JOIN Orders o ON o.order_id = p.order_id
       WHERE p.order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (!rows.length) {
      await connection.rollback();
      return { ok: false, code: "not_found", message: "Payment record not found" };
    }

    const payment = rows[0];

    if (payment.status !== "paid") {
      await connection.rollback();
      return { ok: false, code: "not_paid", message: "Only paid orders can be refunded" };
    }

    if (payment.order_status !== "cancelled") {
      await connection.rollback();
      return { ok: false, code: "order_not_cancelled", message: "Refunds are only available for cancelled orders" };
    }

    if (payment.refund_status === "processed") {
      await connection.rollback();
      return { ok: true, code: "already_refunded", message: "Refund already processed" };
    }

    if (payment.refund_status === "pending") {
      await connection.rollback();
      return { ok: true, code: "refund_pending", message: "Refund is already in progress" };
    }

    if (!payment.provider_payment_id || payment.provider !== "razorpay") {
      await connection.query(
        `UPDATE Payments
         SET refund_status = 'failed',
             refund_failure_reason = 'No eligible Razorpay payment found for refund'
         WHERE order_id = ?`,
        [orderId]
      );
      await connection.commit();
      return { ok: false, code: "missing_payment_id", message: "No eligible Razorpay payment found for refund" };
    }

    await connection.query(
      `UPDATE Payments
       SET refund_status = 'pending',
           refund_failure_reason = NULL
       WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();

    const razorpay = getRazorpayClient();
    const refund = await razorpay.payments.refund(payment.provider_payment_id, {
      amount: Math.round(Number(payment.amount) * 100),
      notes: {
        order_id: String(orderId),
        reason,
        initiated_by: initiatedBy,
      },
    });

    await pool.query(
      `UPDATE Payments
       SET status = 'refunded',
           refund_status = 'processed',
           refund_id = ?,
           refund_amount = ?,
           refund_failure_reason = NULL,
           refunded_at = NOW()
       WHERE order_id = ?`,
      [refund.id, Number(payment.amount), orderId]
    );

    await pool.query(
      `UPDATE Orders
       SET payment_status = 'paid',
           payment_failure_reason = NULL
       WHERE order_id = ?`,
      [orderId]
    );

    return {
      ok: true,
      code: "refunded",
      message: "Refund processed successfully",
      refundId: refund.id,
    };
  } catch (err) {
    await pool.query(
      `UPDATE Payments
       SET refund_status = 'failed',
           refund_failure_reason = ?
       WHERE order_id = ?`,
      [err.message || "Refund failed", orderId]
    );

    return {
      ok: false,
      code: "refund_failed",
      message: err.message || "Refund failed",
    };
  } finally {
    connection.release();
  }
};
