import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Eye, Loader2, Search, Sparkles, WalletCards } from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notice from "../components/Notice.jsx";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "completed", "cancelled"];
const PAYMENT_META = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-700",
  refunded: "bg-sky-100 text-sky-700",
};
const REFUND_META = {
  none: "bg-slate-100 text-slate-500",
  pending: "bg-sky-100 text-sky-700",
  processed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

const FILTER_OPTIONS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [revenue, setRevenue] = useState(0);
  const [statusFilter, setStatusFilter] = useState("active");
  const [notice, setNotice] = useState({ message: "", tone: "info" });
  const [search, setSearch] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

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
        handleViewOrder(selectedOrder.order);
      }
    } catch (err) {
      console.error("Order status update error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to update status.",
        tone: "error",
      });
    }
  };

  const handleViewOrder = async (order) => {
    try {
      setDetailsError("");
      setSelectedOrder((current) => ({
        order,
        items: current?.order?.order_id === order.order_id ? current.items || [] : [],
      }));
      setDetailsLoading(true);
      const res = await axios.get(`/admin-routes/${order.order_id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Order details fetch error:", err);
      setNotice({ message: "Failed to load order details.", tone: "error" });
      setDetailsError(err.response?.data?.message || "Failed to load order details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRetryRefund = async (orderId) => {
    try {
      setRefundLoading(true);
      const res = await axios.post(`/api/payment/refund/${orderId}`, {
        reason: "Manual refund retry from admin panel",
      });
      setNotice({ message: res.data.message || "Refund processed.", tone: "success" });
      await fetchOrders(date);
      const currentOrderId = selectedOrder?.order?.order_id || orderId;
      const orderForRefresh =
        orders.find((order) => order.order_id === currentOrderId) || selectedOrder?.order;
      if (orderForRefresh) {
        await handleViewOrder(orderForRefresh);
      }
    } catch (err) {
      console.error("Refund retry error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to process refund.",
        tone: "error",
      });
    } finally {
      setRefundLoading(false);
    }
  };

  const counters = useMemo(
    () => ({
      active: orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length,
      completed: orders.filter((order) => order.status === "completed").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "active"
          ? ["pending", "preparing", "ready"].includes(order.status)
          : order.status === statusFilter;

      const searchMatch =
        normalizedSearch === "" ||
        order.customer_name?.toLowerCase().includes(normalizedSearch) ||
        String(order.order_no).includes(normalizedSearch);

      return statusMatch && searchMatch;
    });
  }, [orders, search, statusFilter]);

  const shouldShowRefundCard =
    selectedOrder &&
    ((selectedOrder.order.status === "cancelled" &&
      selectedOrder.order.payment_status === "paid" &&
      selectedOrder.order.payment_mode === "Razorpay") ||
      (selectedOrder.order.refund_status || "none") !== "none");

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_24%),linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_28%,_#eef2ff_100%)]">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(255,247,237,0.94)_46%,_rgba(255,237,213,0.9)_100%)] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-orange-600 shadow-sm">
                  <Sparkles size={14} />
                  Paid preorder queue
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Run the kitchen with a cleaner, tighter operations board
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
                  This queue only surfaces paid orders, with quick visibility into order flow,
                  revenue, and exceptions without the clutter of unpaid attempts.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Visible orders
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{orders.length}</p>
                  <p className="mt-1 text-sm text-slate-500">Paid and ready for operations</p>
                </div>

                <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/70 bg-slate-950 px-4 py-4 text-white shadow-sm">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Calendar className="text-orange-300" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Service date
                    </p>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Completed revenue"
              value={`₹${revenue.toFixed(2)}`}
              tone="dark"
              icon={<WalletCards size={18} />}
            />
            <MetricCard label="Active orders" value={counters.active} icon={<Sparkles size={18} />} />
            <MetricCard label="Completed" value={counters.completed} />
            <MetricCard label="Cancelled" value={counters.cancelled} />
          </section>

          <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by order no or customer..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      statusFilter === item.key
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                        : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-[2rem] border border-dashed border-orange-200 bg-white/80 p-12 text-center text-sm text-slate-500 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
              No matching paid orders found for this view.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-[linear-gradient(180deg,_rgba(255,247,237,0.96),_rgba(255,255,255,0.98))] text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 font-semibold">Placed</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-slate-100/80 text-slate-700 transition hover:bg-orange-50/40"
                    >
                      <td className="px-5 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-orange-600">#{order.order_no}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            preorder
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-5 font-medium">{order.customer_name}</td>
                      <td className="px-5 py-5 font-semibold text-slate-900">₹{order.amount}</td>
                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium">{order.payment_mode}</span>
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                              PAYMENT_META[order.payment_status || "paid"] || PAYMENT_META.paid
                            }`}
                          >
                            {(order.payment_status || "paid").toUpperCase()}
                          </span>
                          {(order.refund_status || "none") !== "none" && (
                            <span
                              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                REFUND_META[order.refund_status || "none"] || REFUND_META.none
                              }`}
                            >
                              REFUND {(order.refund_status || "none").toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-5 text-slate-500">
                        {new Date(order.order_date).toLocaleString()}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <select
                            value={order.status}
                            onChange={(event) => updateStatus(order.order_id, event.target.value)}
                            className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition hover:border-orange-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                  Order #{selectedOrder.order.order_no || selectedOrder.order.order_id}
                </p>
                <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  ₹{Number(selectedOrder.order.amount || 0).toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
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
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailCard label="Customer" value={selectedOrder.order.customer_name} />
                  <DetailCard label="Email" value={selectedOrder.order.customer_email} />
                  <DetailCard label="Phone" value={selectedOrder.order.customer_phone} />
                  <DetailCard label="Payment" value={selectedOrder.order.payment_mode} />
                  <DetailCard label="Payment state" value={selectedOrder.order.payment_status || "paid"} />
                  <DetailCard label="Refund state" value={selectedOrder.order.refund_status || "none"} />
                  <DetailCard label="Status" value={selectedOrder.order.status} />
                  <DetailCard
                    label="Pickup time"
                    value={selectedOrder.order.pickup_time || "Not specified"}
                  />
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedOrder.order.customer_address || "No address provided"}
                  </p>
                </div>

                {shouldShowRefundCard ? (
                  <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Refund
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          REFUND_META[selectedOrder.order.refund_status || "none"] || REFUND_META.none
                        }`}
                      >
                        {(selectedOrder.order.refund_status || "none").toUpperCase()}
                      </span>
                      {selectedOrder.order.refund_id && (
                        <span className="text-sm text-slate-600">
                          Refund ID: {selectedOrder.order.refund_id}
                        </span>
                      )}
                    </div>
                    {selectedOrder.order.refund_failure_reason && (
                      <p className="mt-3 text-sm text-rose-700">
                        {selectedOrder.order.refund_failure_reason}
                      </p>
                    )}
                    {selectedOrder.order.status === "cancelled" &&
                      selectedOrder.order.payment_status === "paid" &&
                      selectedOrder.order.payment_mode === "Razorpay" &&
                      selectedOrder.order.refund_status !== "processed" && (
                        <button
                          onClick={() => handleRetryRefund(selectedOrder.order.order_id)}
                          disabled={refundLoading}
                          className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {refundLoading ? "Processing refund..." : "Retry refund"}
                        </button>
                      )}
                  </div>
                ) : null}

                <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Items
                  </h4>
                  {detailsError && (
                    <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {detailsError}
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    {(selectedOrder.items || []).map((item) => (
                      <div
                        key={`${selectedOrder.order.order_id}-${item.item_id || item.name}`}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">₹{item.cost} each</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">x{item.quantity}</span>
                      </div>
                    ))}
                    {!detailsLoading &&
                      !detailsError &&
                      (!selectedOrder.items || selectedOrder.items.length === 0) && (
                        <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500">
                          No item details found for this order.
                        </div>
                      )}
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

const MetricCard = ({ label, value, tone = "light", icon = null }) => (
  <div
    className={`rounded-[1.75rem] p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)] ${
      tone === "dark"
        ? "bg-[linear-gradient(145deg,_#020617,_#0f172a_55%,_#1e293b)] text-white"
        : "border border-white/70 bg-white/80 text-slate-900 backdrop-blur"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <p className={`text-sm font-medium ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>
        {label}
      </p>
      {icon ? (
        <div
          className={`rounded-2xl p-2 ${tone === "dark" ? "bg-white/10 text-orange-300" : "bg-orange-50 text-orange-500"}`}
        >
          {icon}
        </div>
      ) : null}
    </div>
    <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
  </div>
);

const DetailCard = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3">
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
