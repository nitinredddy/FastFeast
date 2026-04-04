import React, { useCallback, useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    today_orders: 0,
    active_menu: 0,
    total_revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const res = await axios.get("/admin/stats");
    setStats(res.data);
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const res = await axios.get(`/admin-routes?date=${today}`);
    setRecentOrders((res.data.orders || []).slice(0, 5));
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentOrders()]);
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRecentOrders, fetchStats]);

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 15000);
    return () => clearInterval(interval);
  }, [refreshDashboard]);

  const cards = [
    { title: "Total Orders", value: stats.total_orders, tone: "bg-slate-900 text-white" },
    { title: "Orders Today", value: stats.today_orders, tone: "bg-orange-500 text-white" },
    { title: "Active Menu Items", value: stats.active_menu, tone: "bg-white text-slate-900" },
    { title: "Completed Revenue", value: `₹${Number(stats.total_revenue || 0).toFixed(0)}`, tone: "bg-white text-slate-900" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                  Operations overview
                </p>
                <h1 className="mt-3 text-3xl font-bold">FastFeast service control center</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Monitor live order volume, menu readiness, and revenue trends from one screen.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Completed revenue today</p>
                <p className="mt-2 text-3xl font-bold">₹{Number(stats.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : (
            <>
              <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                  <div key={card.title} className={`rounded-3xl p-6 shadow-sm ${card.tone}`}>
                    <p className="text-sm font-medium opacity-80">{card.title}</p>
                    <p className="mt-4 text-4xl font-bold">{card.value}</p>
                  </div>
                ))}
              </section>

              <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Recent orders</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest customer activity for today’s service window.
                    </p>
                  </div>
                  <button
                    onClick={refreshDashboard}
                    className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    Refresh
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    No orders have been placed today.
                  </div>
                ) : (
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-3 font-medium">Order</th>
                          <th className="px-3 py-3 font-medium">Customer</th>
                          <th className="px-3 py-3 font-medium">Amount</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                          <th className="px-3 py-3 font-medium">Payment</th>
                          <th className="px-3 py-3 font-medium">Placed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.order_id} className="border-b border-slate-100 text-slate-700">
                            <td className="px-3 py-4 font-semibold text-orange-600">#{order.order_no}</td>
                            <td className="px-3 py-4">{order.customer_name}</td>
                            <td className="px-3 py-4">₹{order.amount}</td>
                            <td className="px-3 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-3 py-4">{order.payment_mode}</td>
                            <td className="px-3 py-4 text-slate-500">
                              {new Date(order.order_date).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

function getStatusBadge(status) {
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
}

export default Dashboard;
