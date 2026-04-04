import pool from "../config/db.js";
import { ensureOrderPaymentSchema } from "./orderSchema.js";

let paymentSchemaEnsured = false;

const REQUIRED_PAYMENT_COLUMNS = [
  "payment_id INT AUTO_INCREMENT PRIMARY KEY",
  "order_id INT NOT NULL",
  "user_id INT NOT NULL",
  "provider VARCHAR(50) NOT NULL DEFAULT 'razorpay'",
  "provider_order_id VARCHAR(255) NULL",
  "provider_payment_id VARCHAR(255) NULL",
  "provider_signature VARCHAR(255) NULL",
  "amount DECIMAL(10,2) NOT NULL",
  "currency VARCHAR(10) NOT NULL DEFAULT 'INR'",
  "status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded') DEFAULT 'pending'",
  "refund_status ENUM('none', 'pending', 'processed', 'failed') DEFAULT 'none'",
  "refund_id VARCHAR(255) NULL",
  "refund_amount DECIMAL(10,2) NULL",
  "failure_reason VARCHAR(255) NULL",
  "refund_failure_reason VARCHAR(255) NULL",
  "expires_at DATETIME NULL",
  "verified_at DATETIME NULL",
  "refunded_at DATETIME NULL",
  "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
  "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
];

export const ensurePaymentSchema = async () => {
  if (paymentSchemaEnsured) {
    return;
  }

  await ensureOrderPaymentSchema();

  await pool.query(
    `CREATE TABLE IF NOT EXISTS Payments (
      payment_id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      user_id INT NOT NULL,
      provider VARCHAR(50) NOT NULL DEFAULT 'razorpay',
      provider_order_id VARCHAR(255) NULL,
      provider_payment_id VARCHAR(255) NULL,
      provider_signature VARCHAR(255) NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
      refund_status ENUM('none', 'pending', 'processed', 'failed') DEFAULT 'none',
      refund_id VARCHAR(255) NULL,
      refund_amount DECIMAL(10,2) NULL,
      failure_reason VARCHAR(255) NULL,
      refund_failure_reason VARCHAR(255) NULL,
      expires_at DATETIME NULL,
      verified_at DATETIME NULL,
      refunded_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
      CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES User(user_id),
      CONSTRAINT uq_payments_order UNIQUE (order_id),
      CONSTRAINT uq_payments_provider_order UNIQUE (provider_order_id),
      CONSTRAINT uq_payments_provider_payment UNIQUE (provider_payment_id)
    )`
  );

  const [paymentRows] = await pool.query("SHOW COLUMNS FROM Payments");
  const paymentColumns = new Set(paymentRows.map((row) => row.Field));

  for (const definition of REQUIRED_PAYMENT_COLUMNS) {
    const columnName = definition.split(" ")[0];
    if (!paymentColumns.has(columnName)) {
      await pool.query(`ALTER TABLE Payments ADD COLUMN ${definition}`);
    }
  }

  await pool.query(
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
      failure_reason,
      expires_at,
      verified_at
    )
    SELECT
      o.order_id,
      o.user_id,
      CASE
        WHEN o.payment_mode = 'Razorpay' THEN 'razorpay'
        ELSE LOWER(COALESCE(o.payment_mode, 'manual'))
      END AS provider,
      o.razorpay_order_id,
      o.razorpay_payment_id,
      o.razorpay_signature,
      COALESCE(o.amount, 0),
      'INR',
      CASE
        WHEN o.status = 'cancelled' AND COALESCE(o.payment_status, 'pending') = 'paid' THEN 'paid'
        WHEN o.status = 'cancelled' THEN 'cancelled'
        ELSE COALESCE(o.payment_status, 'paid')
      END AS status,
      o.payment_failure_reason,
      o.payment_expires_at,
      o.payment_verified_at
    FROM Orders o
    LEFT JOIN Payments p ON p.order_id = o.order_id
    WHERE p.order_id IS NULL`
  );

  paymentSchemaEnsured = true;
};
