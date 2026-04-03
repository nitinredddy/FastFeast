// controllers/orderController.js
import pool from "../config/db.js";

const ALLOWED_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

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

    const invalidItem = items.find(
      (item) => !Number.isInteger(item.item_id) || !Number.isInteger(item.quantity) || item.quantity <= 0
    );
    if (invalidItem) {
      return res.status(400).json({ message: "Each order item needs a valid item_id and quantity" });
    }

    const mergedItems = Array.from(
      items.reduce((map, item) => {
        const existing = map.get(item.item_id);
        map.set(item.item_id, {
          item_id: item.item_id,
          quantity: (existing?.quantity || 0) + item.quantity,
        });
        return map;
      }, new Map()).values()
    );

    const itemIds = mergedItems.map((item) => item.item_id);
    const placeholders = itemIds.map(() => "?").join(", ");
    const [menuItems] = await pool.query(
      `SELECT 
        m.item_id,
        m.name,
        m.availability,
        COALESCE(i.stock_quantity, 0) AS stock_quantity
      FROM Menu m
      LEFT JOIN Inventory i ON i.item_id = m.item_id
      WHERE m.item_id IN (${placeholders})`,
      itemIds
    );

    const menuMap = new Map(menuItems.map((item) => [item.item_id, item]));
    for (const item of mergedItems) {
      const currentItem = menuMap.get(item.item_id);
      if (!currentItem) {
        return res.status(404).json({ message: `Item ${item.item_id} was not found` });
      }

      if (!currentItem.availability) {
        return res.status(400).json({ message: `${currentItem.name} is currently unavailable` });
      }

      if (currentItem.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Only ${currentItem.stock_quantity} serving(s) left for ${currentItem.name}`,
        });
      }
    }

    // Convert items array to JSON string for SQL procedure
    const itemsJson = JSON.stringify(mergedItems);

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

    if (!order.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "customer" && order[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only access your own orders" });
    }

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

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    // ⚡ Use stored procedure to ensure valid transitions
    await pool.query("CALL update_order_status(?, ?)", [id, status]);

    res.json({ message: "Order status updated successfully ✅" });
  } catch (err) {
    console.error("❌ Error updating order status:", err);

    if (err.sqlState === "45000" || err.code === "ER_SIGNAL_EXCEPTION") {
      return res.status(400).json({ message: err.sqlMessage || "Invalid order status transition" });
    }

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

    const [orders] = await pool.query(
      "SELECT order_id, user_id FROM Orders WHERE order_id = ?",
      [id]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orders[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only cancel your own orders" });
    }

    await pool.query("CALL cancel_order(?)", [id]);

    res.json({ message: "Order cancelled successfully ✅" });
  } catch (err) {
    console.error("❌ Error cancelling order:", err);

    if (err.sqlState === "45000" || err.code === "ER_SIGNAL_EXCEPTION") {
      return res.status(400).json({ message: err.sqlMessage });
    }

    res.status(500).json({ message: "Failed to cancel order" });
  }
};
