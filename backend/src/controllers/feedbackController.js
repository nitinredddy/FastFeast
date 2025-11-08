// controllers/feedbackController.js
import pool from "../config/db.js";

// ✏️ Customer adds feedback
export const addFeedback = async (req, res) => {
  try {
    const { item_id, content } = req.body;
    const user_id = req.user.user_id; // from JWT

    if (!item_id || !content) {
      return res.status(400).json({ message: "Missing item_id or content" });
    }

    await pool.query(
      "INSERT INTO Feedback (user_id, item_id, content) VALUES (?, ?, ?)",
      [user_id, item_id, content]
    );

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ message: "Failed to add feedback" });
  }
};

// 📋 Admin/staff view all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.feedback_id,
        u.name AS user_name,
        m.name AS item_name,
        f.content,
        f.feedback_date
      FROM Feedback f
      JOIN User u ON f.user_id = u.user_id
      JOIN Menu m ON f.item_id = m.item_id
      ORDER BY f.feedback_date DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};
