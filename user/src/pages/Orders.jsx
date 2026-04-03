import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock3, Loader2, PackageCheck, Soup, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";

const STATUS_META = {
  pending: {
    label: "Pending",
    chip: "bg-amber-100 text-amber-700",
    message: "Your order is queued and waiting for the kitchen to start.",
  },
  preparing: {
    label: "Preparing",
    chip: "bg-orange-100 text-orange-700",
    message: "The kitchen has started making your order.",
  },
  ready: {
    label: "Ready",
    chip: "bg-emerald-100 text-emerald-700",
    message: "Your order is ready for pickup.",
  },
  completed: {
    label: "Completed",
    chip: "bg-slate-200 text-slate-700",
    message: "Picked up successfully. Enjoy your meal.",
  },
  cancelled: {
    label: "Cancelled",
    chip: "bg-rose-100 text-rose-700",
    message: "This order was cancelled before completion.",
  },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/user");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      const res = await axios.put(`/orders/cancel/${orderId}`);
      toast.success(res.data.message);
      fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_42%,_#f8fafc_100%)]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
            Order Tracker
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Track every preorder in one place</h2>
              <p className="mt-2 text-sm text-slate-500">
                Live status updates refresh automatically, so you know when it is time to pick up.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filter === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {status === "all" ? "All orders" : STATUS_META[status].label}
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
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">No orders yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Once you place a preorder, its status will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {filteredOrders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.pending;
              const totalUnits =
                order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

              return (
                <article
                  key={order.order_id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Order #{order.order_no}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        ₹{Number(order.amount).toFixed(2)}
                      </h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatusInfo icon={<Clock3 size={16} />} label="Placed" value={new Date(order.order_date).toLocaleString()} />
                    <StatusInfo icon={<Soup size={16} />} label="Items" value={`${totalUnits} total`} />
                    <StatusInfo icon={<PackageCheck size={16} />} label="Payment" value={order.payment_mode} />
                  </div>

                  <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {meta.message}
                  </p>

                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">Ordered items</h4>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {order.items?.map((item) => (
                        <li key={`${order.order_id}-${item.item_id}`} className="flex justify-between gap-4">
                          <span>{item.name}</span>
                          <span className="font-medium text-slate-900">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(order.status === "pending" || order.status === "preparing") && (
                    <button
                      onClick={() => handleCancel(order.order_id)}
                      className="mt-5 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                    >
                      Cancel this order
                    </button>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium">
                    {order.status === "completed" && <CheckCircle size={16} className="text-emerald-600" />}
                    {order.status === "cancelled" && <XCircle size={16} className="text-rose-600" />}
                    {(order.status === "pending" || order.status === "preparing" || order.status === "ready") && (
                      <Clock3 size={16} className="text-orange-500" />
                    )}
                    <span className="text-slate-600">{meta.message}</span>
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

const StatusInfo = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      {icon}
      {label}
    </div>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

export default Orders;
