// controllers/adminController.js
import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 🧾 Total orders
    const [[{ total_orders }]] = await pool.query(
      "SELECT COUNT(*) AS total_orders FROM Orders"
    );

    // 🍔 Active menu items (available = TRUE)
    const [[{ active_menu }]] = await pool.query(
      "SELECT COUNT(*) AS active_menu FROM Menu WHERE availability = TRUE"
    );

    // 💰 Today's revenue (using daily_revenue_view)
    const [[{ total_revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_revenue), 0) AS total_revenue FROM daily_revenue_view WHERE order_day = CURDATE()"
    );

    res.json({ total_orders, active_menu, total_revenue });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
