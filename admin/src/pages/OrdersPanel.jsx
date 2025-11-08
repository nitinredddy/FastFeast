import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import { Eye, Loader2, Calendar } from "lucide-react";

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [revenue, setRevenue] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchOrders(date);
  }, [date]);

  const fetchOrders = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin-routes?date=${selectedDate}`);
      setOrders(res.data.orders || []);
      setRevenue(Number(res.data.totalRevenue || 0));
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/admin-routes/${id}`, { status: newStatus });
      fetchOrders(date);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  // ✅ Treat "preparing" as "pending" for filtering
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : statusFilter === "pending"
      ? orders.filter(
          (o) => o.status === "pending" || o.status === "preparing"
        )
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Navbar />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {statusFilter === "completed"
                ? "Completed Orders ✅"
                : "Active Orders 🕒"}
            </h2>

            {/* 📅 Date Picker */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
              <Calendar className="text-orange-500" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="outline-none text-gray-700 text-sm"
              />
            </div>
          </div>

          {/* 💰 Revenue Summary */}
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-orange-700">
              Total Revenue for {date}:
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              ₹{Number(revenue || 0).toFixed(2)}
            </p>
          </div>

          {/* 🧾 Status Filter (Pending includes Preparing) */}
          <div className="flex gap-3 mb-4">
            {["pending", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                }`}
              >
                {s === "pending" ? "Pending" : "Completed"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No {statusFilter} orders found 🍽️
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="p-3">Order No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 font-semibold text-orange-600">
                        #{order.order_no}
                      </td>
                      <td className="p-3">{order.customer_name}</td>
                      <td className="p-3">₹{order.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* ✅ Disable status change for completed orders */}
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>

                        {order.status !== "completed" && (
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order.order_id, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            {["pending", "completed"].map(
                              (s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              )
                            )}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 🪟 Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[500px] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Order #{selectedOrder.order_no}
            </h3>

            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>
                <strong>Customer:</strong> {selectedOrder.customer_name}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedOrder.amount}
              </p>
              <p>
                <strong>Payment:</strong> {selectedOrder.payment_mode}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.order_date).toLocaleString()}
              </p>
            </div>

            <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
            <ul className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b last:border-none py-1"
                  >
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-400 text-center py-2">
                  No item details available
                </p>
              )}
            </ul>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPanel;
