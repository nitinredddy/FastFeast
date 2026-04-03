// controllers/menuController.js
import pool from "../config/db.js";

// 📜 Get all menu items (for admin or user)
export const getMenu = async (req, res) => {
  try {
    const { category, availableOnly } = req.query;

    let query = `SELECT 
      m.*,
      COALESCE(i.stock_quantity, 0) AS stock_quantity
    FROM Menu m
    LEFT JOIN Inventory i ON i.item_id = m.item_id`;
    const params = [];

    if (category && availableOnly) {
      query += " WHERE m.category = ? AND m.availability = TRUE";
      params.push(category);
    } else if (category) {
      query += " WHERE m.category = ?";
      params.push(category);
    } else if (availableOnly) {
      query += " WHERE m.availability = TRUE";
    }

    query += " ORDER BY m.category, m.name";

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
    const { name, cost, category, availability = true, stock_quantity = 0 } = req.body;

    if (!name || !cost || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO Menu (name, cost, category, availability) VALUES (?, ?, ?, ?)",
      [name, cost, category, availability]
    );

    await pool.query(
      "INSERT IGNORE INTO Inventory (item_id, stock_quantity) VALUES (?, ?)",
      [result.insertId, stock_quantity]
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
    const { name, cost, category, availability } = req.body;

    if (!name || !cost || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    await pool.query(
      "UPDATE Menu SET name = ?, cost = ?, category = ?, availability = ? WHERE item_id = ?",
      [name, cost, category, availability, id]
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

    const [[menuItem]] = await pool.query(
      "SELECT item_id, name FROM Menu WHERE item_id = ?",
      [id]
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const [[orderRefs]] = await pool.query(
      "SELECT COUNT(*) AS total FROM OrderItem WHERE item_id = ?",
      [id]
    );
    const [[feedbackRefs]] = await pool.query(
      "SELECT COUNT(*) AS total FROM Feedback WHERE item_id = ?",
      [id]
    );

    if (orderRefs.total > 0 || feedbackRefs.total > 0) {
      await pool.query(
        "UPDATE Menu SET availability = FALSE WHERE item_id = ?",
        [id]
      );

      return res.json({
        message: `${menuItem.name} has existing history, so it was archived by marking it unavailable instead of being deleted.`,
        archived: true,
      });
    }

    await pool.query("DELETE FROM Inventory WHERE item_id = ?", [id]);
    await pool.query("DELETE FROM Menu WHERE item_id = ?", [id]);
    res.json({ message: "Item deleted successfully", archived: false });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
