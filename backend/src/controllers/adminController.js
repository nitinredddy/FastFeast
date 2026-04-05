// controllers/adminController.js
import pool from "../config/db.js";
import { ensureOrderPaymentSchema } from "../lib/orderSchema.js";
import { ensurePaymentSchema } from "../lib/paymentSchema.js";

export const getDashboardStats = async (req, res) => {
  try {
    await ensureOrderPaymentSchema();
    await ensurePaymentSchema();
    // 🧾 Total orders
    const [[{ total_orders }]] = await pool.query(
      `SELECT COUNT(*) AS total_orders
       FROM Orders o
       LEFT JOIN Payments p ON p.order_id = o.order_id
       WHERE COALESCE(p.status, o.payment_status, 'paid') = 'paid'`
    );

    const [[{ today_orders }]] = await pool.query(
      `SELECT COUNT(*) AS today_orders
       FROM Orders o
       LEFT JOIN Payments p ON p.order_id = o.order_id
       WHERE DATE(o.order_date) = CURDATE()
         AND COALESCE(p.status, o.payment_status, 'paid') = 'paid'`
    );

    // 🍔 Active menu items (available = TRUE)
    const [[{ active_menu }]] = await pool.query(
      "SELECT COUNT(*) AS active_menu FROM Menu WHERE availability = TRUE"
    );

    // 💰 Today's revenue (using daily_revenue_view)
    const [[{ total_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(o.amount), 0) AS total_revenue
       FROM Orders o
       LEFT JOIN Payments p ON p.order_id = o.order_id
       WHERE DATE(o.order_date) = CURDATE()
         AND COALESCE(p.status, o.payment_status, 'paid') = 'paid'
         AND COALESCE(p.refund_status, 'none') <> 'processed'`
    );

    res.json({ total_orders, today_orders, active_menu, total_revenue });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
