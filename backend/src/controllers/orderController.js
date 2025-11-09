// controllers/orderController.js
import pool from "../config/db.js";

/* ============================
   🧾 Create a New Order (User)
=============================== */
export const createOrder = async (req, res) => {
  try {
    const { items, payment_mode = "UPI", pickup_time = null } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Items required" });

    // ✅ Fetch item prices for validation
    const ids = items.map((i) => i.item_id);
    const [menuItems] = await pool.query(
      `SELECT item_id, price FROM Menu WHERE item_id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    const priceMap = {};
    menuItems.forEach((m) => (priceMap[m.item_id] = m.price));

    let total = 0;
    items.forEach((it) => (total += priceMap[it.item_id] * it.quantity));

    // 🕒 Get today's order count for order_no
    const today = new Date().toISOString().split("T")[0];
    const [existing] = await pool.query(
      `SELECT COUNT(*) AS count FROM Orders WHERE DATE(order_date) = ?`,
      [today]
    );
    const order_no = existing[0].count + 1;

    // ⚠️ FIXED: Correct number of placeholders (6 values → 6 ?)
    const [orderRes] = await pool.query(
      `INSERT INTO Orders (user_id, amount, payment_mode, pickup_time, order_no, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.user_id, total, payment_mode, pickup_time, order_no, "preparing"]
    );

    const order_id = orderRes.insertId;

    // ✅ Insert order items
    for (const it of items) {
      await pool.query(
        `INSERT INTO OrderItem (order_id, item_id, quantity) VALUES (?, ?, ?)`,
        [order_id, it.item_id, it.quantity]
      );
    }

    res.status(201).json({
      message: "Order placed successfully",
      order_id,
      order_no,
      amount: total,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};

/* ============================
   📦 Get Order by ID
=============================== */
export const getOrderById = async (req, res) => {
  try {
    const [order] = await pool.query(
      "SELECT * FROM Orders WHERE order_id = ?",
      [req.params.id]
    );
    const [items] = await pool.query(
      `SELECT m.name, oi.quantity, m.price 
       FROM OrderItem oi 
       JOIN Menu m ON oi.item_id = m.item_id 
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ order: order[0], items });
  } catch (err) {
    console.error("❌ Error fetching order by ID:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ============================
   🧍‍♂️ Get All Orders for Admin
=============================== */
export const getAllOrders = async (req, res) => {
  try {
    // 🗓️ Filter by date or default to today
    const today = new Date().toISOString().split("T")[0];
    const date = req.query.date || today;

    // ✅ Orders sorted by order_no (FIFO)
    const [orders] = await pool.query(
      `SELECT 
          o.order_id, 
          o.order_no, 
          o.user_id, 
          u.name AS customer_name, 
          o.amount, 
          o.status, 
          o.payment_mode, 
          o.order_date
       FROM Orders o
       JOIN User u ON o.user_id = u.user_id
       WHERE DATE(o.order_date) = ?
       ORDER BY o.order_no ASC`,
      [date]
    );

    // 🧾 Attach item details for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT m.name, oi.quantity, m.price 
         FROM OrderItem oi
         JOIN Menu m ON oi.item_id = m.item_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
    }

    // 💰 Calculate daily revenue (for completed)
    const [revenueResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRevenue 
       FROM Orders 
       WHERE DATE(order_date) = ? AND status = 'completed'`,
      [date]
    );

    res.json({
      date,
      totalRevenue: revenueResult[0].totalRevenue || 0,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ============================
   🔄 Update Order Status (Admin)
=============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE Orders SET status = ? WHERE order_id = ?", [
      status,
      id,
    ]);
    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* ============================
   👤 Get Orders for Logged-In User
=============================== */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
          o.order_id,
          o.order_no,
          o.amount,
          o.payment_mode,
          o.status,
          o.order_date,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'item_id', oi.item_id,
                  'name', m.name,
                  'quantity', oi.quantity
              )
          ) AS items
        FROM Orders o
        JOIN OrderItem oi ON o.order_id = oi.order_id
        JOIN Menu m ON oi.item_id = m.item_id
        WHERE o.user_id = ?
        GROUP BY o.order_id, o.amount, o.payment_mode, o.status, o.order_date, o.order_no
        ORDER BY o.order_date DESC, o.order_no ASC`,
      [userId]
    );

    // ✅ Return direct array (for frontend)
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json([]);
  }
};
