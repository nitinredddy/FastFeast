// controllers/inventoryController.js
import pool from "../config/db.js";

export const getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        i.item_id,
        m.name,
        m.category,
        m.cost,
        m.availability,
        i.stock_quantity,
        i.last_updated
      FROM Inventory i
      JOIN Menu m ON i.item_id = m.item_id
      ORDER BY m.category, m.name`
    );

    res.json(rows);
  } catch (err) {
    console.error("Inventory fetch error:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
      return res.status(400).json({ message: "Stock quantity must be a non-negative integer" });
    }

    await pool.query(
      "UPDATE Inventory SET stock_quantity = ? WHERE item_id = ?",
      [stock_quantity, id]
    );

    res.json({ message: "Inventory updated successfully" });
  } catch (err) {
    console.error("Inventory update error:", err);
    res.status(500).json({ message: "Failed to update inventory" });
  }
};
