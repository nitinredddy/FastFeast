import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  PackageCheck,
  Soup,
  XCircle,
  Flame,
  ArrowRight,
  MessageSquarePlus,
  RefreshCw,
  ChefHat,
  Ticket,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { normalizeOrders } from "../utils/orders";

const STATUS_STEPS = ["pending", "preparing", "ready", "completed"];

const STATUS_CONFIG = {
  pending: {
    label: "Queued",
    color: "amber",
    chip: "bg-amber-50 text-amber-700 border-amber-200/60",
    message: "Order received. Waiting for kitchen queue slot.",
    stepIndex: 0,
  },
  preparing: {
    label: "In the Kitchen",
    color: "brand",
    chip: "bg-orange-50 text-orange-700 border-orange-200/60",
    message: "Chefs are actively cooking and packing your meal.",
    stepIndex: 1,
  },
  ready: {
    label: "Ready for Pickup! 🎉",
    color: "emerald",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold animate-pulseSubtle",
    message: "Hot & packed at the counter. Show your token to collect!",
    stepIndex: 2,
  },
  completed: {
    label: "Completed",
    color: "slate",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    message: "Picked up and served. Enjoy your food!",
    stepIndex: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "rose",
    chip: "bg-rose-50 text-rose-700 border-rose-200/60",
    message: "Order was cancelled.",
    stepIndex: -1,
  },
};

const PAYMENT_META = {
  pending: { label: "Payment pending", chip: "bg-amber-50 text-amber-700 border-amber-200/60" },
  paid: { label: "Paid", chip: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  failed: { label: "Payment failed", chip: "bg-rose-50 text-rose-700 border-rose-200/60" },
  cancelled: { label: "Payment cancelled", chip: "bg-slate-100 text-slate-700 border-slate-200" },
  refunded: { label: "Refunded", chip: "bg-sky-50 text-sky-700 border-sky-200/60" },
};

const REFUND_META = {
  none: null,
  pending: { label: "Refund Processing", chip: "bg-sky-50 text-sky-700 border-sky-200/60" },
  processed: { label: "Refund Settled", chip: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  failed: { label: "Refund Query", chip: "bg-rose-50 text-rose-700 border-rose-200/60" },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/user");
      setOrders(res.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));
    }
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const normalizedOrders = useMemo(
    () => normalizeOrders(filteredOrders),
    [filteredOrders]
  );

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this preorder? If paid, a refund will be processed to your payment method.")) {
      return;
    }

    try {
      const res = await axios.put(`/orders/cancel/${orderId}`);
      toast.success(res.data.message || "Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] subtle-mesh pb-20">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <section className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600 border border-brand-200/60">
                <Ticket size={14} />
                <span>Live Digital Counter Tracker</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-slate-900">
                My Preorders & Pickup Passes
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Auto-refreshes live so you can arrive at the counter right when food is hot.
              </p>
            </div>

            {/* Quick manual refresh and auto-sync badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Syncs every 25s</span>
              </span>
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-slate-100">
            {[
              { id: "all", label: "All Preorders" },
              { id: "active", label: "Active Orders" },
              { id: "ready", label: "Ready for Pickup" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? "bg-slate-900 text-white shadow-subtle"
                    : "bg-slate-100/80 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Orders Listing */}
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={36} />
            <p className="mt-4 text-xs font-medium text-slate-500">Loading your preorder tickets...</p>
          </div>
        ) : normalizedOrders.length === 0 ? (
          <div className="mt-8 rounded-[2.5rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-subtle">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
              <Soup size={26} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">No preorders found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              You don’t have any {filter !== "all" ? `${filter} ` : ""}orders yet. Ready for some delicious canteen food?
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600"
            >
              <span>Explore Today's Menu</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {normalizedOrders.map((order) => {
              const meta = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const payment = PAYMENT_META[order.payment_status || "paid"] || PAYMENT_META.paid;
              const refund = REFUND_META[order.refund_status || "none"];
              const totalUnits = order.items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              );
              const amount = Number(order.amount || 0);
              const placedAt = order.order_date
                ? new Date(order.order_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";
              const dateStr = order.order_date
                ? new Date(order.order_date).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })
                : "Today";

              const isReady = order.status === "ready";
              const isPreparing = order.status === "preparing";
              const isCompleted = order.status === "completed";
              const isCancelled = order.status === "cancelled";

              return (
                <article
                  key={order.order_id}
                  className={`relative overflow-hidden rounded-[2.5rem] border bg-white p-6 sm:p-8 shadow-card transition-all ${
                    isReady
                      ? "border-emerald-300 ring-2 ring-emerald-400/20"
                      : "border-slate-200/80"
                  }`}
                >
                  {/* Top Bar: Token & Live Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      {/* High-Contrast Digital Counter Token Pass */}
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-2.5 text-white shadow-subtle">
                        <Ticket size={20} className="text-orange-400" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            Counter Token
                          </p>
                          <p className="font-display text-xl font-black text-white tracking-wide">
                            #{order.order_no}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Placed at {placedAt} ({dateStr})</span>
                          {order.pickup_time && (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 border border-brand-200/60">
                              Pickup slot: {order.pickup_time}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                          Total: <span className="text-slate-900 font-bold text-base">₹{amount.toFixed(2)}</span>
                          <span className="text-xs text-slate-400 ml-1.5">({totalUnits} {totalUnits === 1 ? "dish" : "dishes"})</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${meta.chip}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Visual Stepper (for non-cancelled orders) */}
                  {!isCancelled && (
                    <div className="py-6 border-b border-slate-100">
                      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                        {/* Connecting background line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />

                        {STATUS_STEPS.map((stepKey, idx) => {
                          const currentStepIdx = meta.stepIndex;
                          const isFinished = currentStepIdx > idx;
                          const isCurrent = currentStepIdx === idx;
                          const stepTitles = ["Received", "In Kitchen", "Ready at Counter", "Picked Up"];

                          return (
                            <div key={stepKey} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                  isFinished
                                    ? "bg-slate-900 text-white"
                                    : isCurrent
                                    ? isReady
                                      ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                                      : "bg-brand-500 text-white ring-4 ring-brand-100"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {isFinished ? <CheckCircle2 size={16} /> : idx + 1}
                              </div>
                              <span
                                className={`mt-2 text-[11px] font-semibold ${
                                  isCurrent
                                    ? "text-slate-900"
                                    : isFinished
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {stepTitles[idx]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Status contextual note */}
                      <div className={`mt-4 rounded-2xl p-3 text-xs text-center font-medium ${
                        isReady
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                          : isPreparing
                          ? "bg-orange-50 text-orange-800 border border-orange-200/80"
                          : "bg-slate-50 text-slate-600"
                      }`}>
                        {meta.message}
                      </div>
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      Dishes in this order
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {order.items.map((item) => (
                        <div
                          key={`${order.order_id}-${item.item_id}`}
                          className="flex items-center justify-between rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-2.5 text-xs"
                        >
                          <span className="font-medium text-slate-800">{item.name}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-700 border border-slate-200 shadow-xs">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Refund Badges Row */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${payment.chip}`}>
                        {payment.label}
                      </span>
                      {refund && (
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${refund.chip}`}>
                          {refund.label}
                        </span>
                      )}
                      {order.refund_failure_reason && order.refund_status === "failed" && (
                        <span className="text-xs text-rose-600 font-medium">
                          Note: {order.refund_failure_reason}
                        </span>
                      )}
                    </div>

                    {/* Actions: Cancel if pending or Leave Feedback if completed */}
                    <div className="flex items-center gap-2">
                      {(order.status === "pending" || order.status === "preparing") && (
                        <button
                          onClick={() => handleCancel(order.order_id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95"
                        >
                          Cancel Preorder
                        </button>
                      )}

                      {order.status === "completed" && (
                        <Link
                          to="/feedback"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 active:scale-95"
                        >
                          <MessageSquarePlus size={14} />
                          <span>Rate Food</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
