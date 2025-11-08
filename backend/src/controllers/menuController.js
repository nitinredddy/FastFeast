// controllers/menuController.js
import pool from "../config/db.js";

// 📜 Get all menu items (for admin or user)
export const getMenu = async (req, res) => {
  try {
    const { category, availableOnly } = req.query;

    let query = "SELECT * FROM Menu";
    const params = [];

    if (category && availableOnly) {
      query += " WHERE category = ? AND availability = TRUE";
      params.push(category);
    } else if (category) {
      query += " WHERE category = ?";
      params.push(category);
    } else if (availableOnly) {
      query += " WHERE availability = TRUE";
    }

    query += " ORDER BY category, name";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

// ➕ Add a new menu item (admin only)
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, availability = true } = req.body;

    const [result] = await pool.query(
      "INSERT INTO Menu (name, price, category, availability) VALUES (?, ?, ?, ?)",
      [name, price, category, availability]
    );

    res.status(201).json({ message: "Item added successfully", id: result.insertId });
  } catch (err) {
    console.error("Error adding menu item:", err);
    res.status(500).json({ message: "Failed to add menu item" });
  }
};

// ✏️ Update a menu item (admin only)
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, availability } = req.body;

    await pool.query(
      "UPDATE Menu SET name = ?, price = ?, category = ?, availability = ? WHERE item_id = ?",
      [name, price, category, availability, id]
    );

    res.json({ message: "Menu item updated successfully" });
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

// 🔄 Toggle availability (admin/staff)
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    await pool.query(
      "UPDATE Menu SET availability = ? WHERE item_id = ?",
      [availability, id]
    );

    res.json({ message: `Item ${availability ? "made available" : "marked unavailable"}` });
  } catch (err) {
    console.error("Error toggling availability:", err);
    res.status(500).json({ message: "Failed to toggle item availability" });
  }
};

// ❌ Delete menu item (admin only)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Menu WHERE item_id = ?", [id]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
