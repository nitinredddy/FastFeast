import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Eye, Loader2 } from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notice from "../components/Notice.jsx";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "completed", "cancelled"];

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [revenue, setRevenue] = useState(0);
  const [statusFilter, setStatusFilter] = useState("active");
  const [notice, setNotice] = useState({ message: "", tone: "info" });

  useEffect(() => {
    fetchOrders(date);
  }, [date]);

  const fetchOrders = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin-routes?date=${selectedDate}`);
      setOrders(res.data.orders || []);
      setRevenue(Number(res.data.totalRevenue || 0));
      setNotice({ message: "", tone: "info" });
    } catch (err) {
      console.error("Fetch orders error:", err);
      setNotice({ message: "Failed to fetch orders.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/admin-routes/${id}`, { status: newStatus });
      setNotice({ message: "Order status updated successfully.", tone: "success" });
      fetchOrders(date);

      if (selectedOrder?.order?.order_id === id) {
        handleViewOrder(id);
      }
    } catch (err) {
      console.error("Order status update error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to update status.",
        tone: "error",
      });
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setDetailsLoading(true);
      const res = await axios.get(`/admin-routes/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Order details fetch error:", err);
      setNotice({ message: "Failed to load order details.", tone: "error" });
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "active") {
      return orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status));
    }

    if (statusFilter === "completed") {
      return orders.filter((order) => order.status === "completed");
    }

    if (statusFilter === "cancelled") {
      return orders.filter((order) => order.status === "cancelled");
    }

    return orders;
  }, [orders, statusFilter]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
                  Order workflow
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Run today’s order queue</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Move orders from pending to pickup-ready while keeping an eye on completed revenue.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Calendar className="text-orange-500" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Completed revenue</p>
              <p className="mt-2 text-3xl font-bold">₹{revenue.toFixed(2)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "active", label: "Active" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
                { key: "all", label: "All" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    statusFilter === item.key
                      ? "bg-orange-500 text-white"
                      : "bg-white text-slate-600 shadow-sm hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              No matching orders found for this date.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="border-b border-slate-100 text-slate-700">
                      <td className="px-4 py-4 font-semibold text-orange-600">#{order.order_no}</td>
                      <td className="px-4 py-4">{order.customer_name}</td>
                      <td className="px-4 py-4">₹{order.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">{order.payment_mode}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order.order_id)}
                            className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <select
                            value={order.status}
                            onChange={(event) => updateStatus(order.order_id, event.target.value)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                  Order #{selectedOrder.order.order_no || selectedOrder.order.order_id}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  ₹{Number(selectedOrder.order.amount || 0).toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600"
              >
                Close
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-orange-500" size={28} />
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <DetailCard label="Customer ID" value={selectedOrder.order.user_id} />
                  <DetailCard label="Payment" value={selectedOrder.order.payment_mode} />
                  <DetailCard label="Status" value={selectedOrder.order.status} />
                  <DetailCard
                    label="Placed at"
                    value={new Date(selectedOrder.order.order_date).toLocaleString()}
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Items
                  </h4>
                  <div className="mt-4 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={`${selectedOrder.order.order_id}-${item.name}`}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">₹{item.cost} each</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-900">{value || "N/A"}</p>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "preparing":
      return "bg-orange-100 text-orange-700";
    case "ready":
      return "bg-emerald-100 text-emerald-700";
    case "completed":
      return "bg-slate-100 text-slate-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default OrdersPanel;
