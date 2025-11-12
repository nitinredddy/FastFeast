import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // ⏱️ Optional: Poll every 30 seconds to refresh
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/user");

      // ✅ Sort orders so that the latest appear first
      const sortedOrders = [...res.data].sort((a, b) => {
        const dateA = new Date(a.order_date);
        const dateB = new Date(b.order_date);
        if (dateA.getTime() === dateB.getTime()) {
          return b.order_no - a.order_no; // latest order_no first if same day
        }
        return dateB - dateA; // latest date first
      });

      setOrders(sortedOrders);
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "preparing":
        return "Your order is being prepared 🍳";
      case "ready":
        return "Your order is ready for pickup 🥡";
      case "completed":
        return "Enjoy your meal 😋";
      case "cancelled":
        return "You cancelled this order ❌";
      default:
        return "Order status unknown";
    }
  };

  // 🚫 Cancel Order
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await axios.put(`/orders/cancel/${orderId}`);
      toast.success(res.data.message);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(
        err.response?.data?.message || "Failed to cancel order. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📦 My Orders</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-lg">
            You haven’t placed any preorders yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Order #{order.order_no}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Payment + Amount */}
                <div className="text-gray-600 text-sm mb-2">
                  Payment Mode: <strong>{order.payment_mode}</strong>
                </div>
                <div className="text-gray-600 text-sm mb-4">
                  Amount Paid: <strong>₹{order.amount}</strong>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="text-gray-700 font-medium mb-1">
                    Ordered Items:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {order.items?.map((item) => (
                      <li key={item.item_id}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Queue Info */}
                <div className="text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">
                    Queue Position:
                  </span>{" "}
                  #{order.order_no}
                </div>

                {/* Status Message */}
                <div className="text-orange-600 text-sm font-medium mb-4">
                  {getStatusMessage(order.status)}
                </div>

                {/* Cancel Order Button */}
                {(order.status === "pending" || order.status === "preparing") && (
                  <button
                    onClick={() => handleCancel(order.order_id)}
                    className="w-full mt-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(order.order_date).toLocaleString()}
                  </span>

                  {order.status === "completed" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : order.status === "ready" ? (
                    <span className="text-green-600 font-semibold">
                      Ready for Pickup
                    </span>
                  ) : order.status === "cancelled" ? (
                    <span className="text-red-500 font-medium">Cancelled</span>
                  ) : (
                    <span className="text-orange-500 font-medium">
                      Preparing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
