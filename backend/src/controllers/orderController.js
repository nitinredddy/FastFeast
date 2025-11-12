// controllers/orderController.js
import pool from "../config/db.js";

/* ============================
   🧾 Create a New Order (User)
   Uses: create_order_with_items()
=============================== */
export const createOrder = async (req, res) => {
  try {
    const { items, payment_mode = "UPI", pickup_time = null } = req.body;
    const user_id = req.user.user_id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Items required" });

    // Convert items array to JSON string for SQL procedure
    const itemsJson = JSON.stringify(items);

    // ⚡ Call stored procedure to handle everything atomically
    const [resultSets] = await pool.query(
      "CALL create_order_with_items(?, ?, ?, ?)",
      [user_id, payment_mode, pickup_time, itemsJson]
    );

    // The first result set contains the returned order info
    const orderInfo = resultSets[0]?.[0];

    res.status(201).json({
      message: "Order placed successfully ✅",
      order_id: orderInfo?.order_id,
      order_no: orderInfo?.order_no,
      amount: orderInfo?.amount,
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
      `SELECT m.name, oi.quantity, m.cost 
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
   Uses: get_orders_by_date()
=============================== */
export const getAllOrders = async (req, res) => {
  try {
    // 🗓️ Filter by date or default to today
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const date = req.query.date || today;

    // ⚡ Call the stored procedure
    const [resultSets] = await pool.query("CALL get_orders_by_date(?)", [date]);

    // Result set 0 = orders, Result set 1 = totalRevenue
    const orders = resultSets[0];
    const totalRevenue = resultSets[1]?.[0]?.totalRevenue || 0;

    res.json({ date, totalRevenue, orders });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ============================
   🔄 Update Order Status (Admin)
   Uses: update_order_status()
=============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ⚡ Use stored procedure to ensure valid transitions
    await pool.query("CALL update_order_status(?, ?)", [id, status]);

    res.json({ message: "Order status updated successfully ✅" });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* ============================
   👤 Get Orders for Logged-In User
   Uses: get_user_orders()
=============================== */
export const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // ⚡ Fetch via stored procedure
    const [resultSets] = await pool.query("CALL get_user_orders(?)", [user_id]);

    const orders = resultSets[0] || [];

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json([]);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params; // order_id

    await pool.query("CALL cancel_order(?)", [id]);

    res.json({ message: "Order cancelled successfully ✅" });
  } catch (err) {
    console.error("❌ Error cancelling order:", err);

    if (err.code === "45000") {
      // Custom SQL SIGNAL error
      return res.status(400).json({ message: err.sqlMessage });
    }

    res.status(500).json({ message: "Failed to cancel order" });
  }
};
