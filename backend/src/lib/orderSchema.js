import pool from "../config/db.js";

let schemaEnsured = false;

const REQUIRED_ORDER_COLUMNS = [
  "canteen_id INT DEFAULT 1",
  "payment_status ENUM('pending', 'paid', 'failed', 'cancelled') DEFAULT 'pending'",
  "razorpay_order_id VARCHAR(255) NULL",
  "razorpay_payment_id VARCHAR(255) NULL",
  "razorpay_signature VARCHAR(255) NULL",
  "payment_expires_at DATETIME NULL",
  "payment_verified_at DATETIME NULL",
  "payment_failure_reason VARCHAR(255) NULL",
];

export const getOrderColumns = async () => {
  const [rows] = await pool.query("SHOW COLUMNS FROM Orders");
  return new Set(rows.map((row) => row.Field));
};

export const ensureOrderPaymentSchema = async () => {
  if (schemaEnsured) {
    return;
  }

  const columns = await getOrderColumns();

  for (const definition of REQUIRED_ORDER_COLUMNS) {
    const columnName = definition.split(" ")[0];
    if (!columns.has(columnName)) {
      await pool.query(`ALTER TABLE Orders ADD COLUMN ${definition}`);
    }
  }

  const updatedColumns = await getOrderColumns();
  if (updatedColumns.has("razorpay_order_id")) {
    try {
      await pool.query(
        "ALTER TABLE Orders ADD UNIQUE KEY uq_orders_razorpay_order_id (razorpay_order_id)"
      );
    } catch (err) {
      if (!String(err.message).includes("Duplicate key name")) {
        throw err;
      }
    }
  }

  if (updatedColumns.has("razorpay_payment_id")) {
    try {
      await pool.query(
        "ALTER TABLE Orders ADD UNIQUE KEY uq_orders_razorpay_payment_id (razorpay_payment_id)"
      );
    } catch (err) {
      if (!String(err.message).includes("Duplicate key name")) {
        throw err;
      }
    }
  }

  schemaEnsured = true;
};
