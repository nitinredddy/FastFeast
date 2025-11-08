import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🕒 Fetch orders on mount + every 30s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/user", { withCredentials: true });
      console.log("🟢 Orders response:", res.data);
  
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        console.warn("⚠️ Unexpected orders structure:", res.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📦 My Orders</h2>

        {loading ? (
          // Loader State
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : Array.isArray(orders) && orders.length > 0 ? (
          // ✅ Orders Available
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Order #{order.order_id}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Info */}
                <p className="text-gray-600 text-sm mb-2">
                  Payment Mode: <strong>{order.payment_mode}</strong>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Amount Paid: <strong>₹{order.amount}</strong>
                </p>

                {/* 🧾 Order Items */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-gray-700 font-medium mb-1">
                    Ordered Items:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item.item_id}>
                          {item.name} × {item.quantity}
                        </li>
                      ))
                    ) : (
                      <li>No items found</li>
                    )}
                  </ul>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {order.order_date
                      ? new Date(order.order_date).toLocaleString()
                      : "Date unavailable"}
                  </span>

                  {order.status === "completed" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : (
                    <span className="text-orange-500 font-medium">
                      Awaiting pickup
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ❌ No Orders
          <div className="text-center text-gray-500 py-10 text-lg">
            You haven’t placed any preorders yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
