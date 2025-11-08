// controllers/reportController.js
import pool from "../config/db.js";

export const userTotalSpent = async (req, res) => {
  const [rows] = await pool.query("CALL GetUserTotalSpent(?)", [req.params.id]);
  res.json(rows[0]);
};

export const orderDiscount = async (req, res) => {
  const [order] = await pool.query("SELECT amount FROM Orders WHERE order_id = ?", [
    req.params.id,
  ]);
  const [disc] = await pool.query("SELECT CalculateDiscount(?) AS discount", [
    order[0].amount,
  ]);
  res.json({ order_id: req.params.id, discount: disc[0].discount });
};
