// controllers/reportController.js
import pool from "../config/db.js";

export const userTotalSpent = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetUserTotalSpent(?)", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("User total spent error:", err);
    res.status(500).json({ message: "Failed to fetch user spend" });
  }
};

export const orderDiscount = async (req, res) => {
  try {
    const [order] = await pool.query("SELECT amount FROM Orders WHERE order_id = ?", [
      req.params.id,
    ]);

    if (!order.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [disc] = await pool.query("SELECT CalculateDiscount(?) AS discount", [
      order[0].amount,
    ]);
    res.json({ order_id: req.params.id, discount: disc[0].discount });
  } catch (err) {
    console.error("Order discount error:", err);
    res.status(500).json({ message: "Failed to fetch order discount" });
  }
};
