// controllers/adminController.js
import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query(
      "SELECT COUNT(*) AS total_orders FROM Orders"
    );
    const [[{ active_menu }]] = await pool.query(
      "SELECT COUNT(*) AS active_menu FROM Menu WHERE availability = TRUE"
    );
    const [[{ low_stock }]] = await pool.query(
      "SELECT COUNT(*) AS low_stock FROM Inventory WHERE stock_quantity < 10"
    );

    res.json({ total_orders, active_menu, low_stock });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
