// controllers/inventoryController.js
import pool from "../config/db.js";

export const getInventory = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT i.item_id, m.name, i.stock_quantity, i.last_updated FROM Inventory i JOIN Menu m ON i.item_id = m.item_id"
  );
  res.json(rows);
};
