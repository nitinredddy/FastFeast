import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    active_menu: 0,
    low_stock: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔸 Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  };

  // 🔸 Fetch recent orders (show 5 latest)
  const fetchRecentOrders = async () => {
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const res = await axios.get(`/admin-routes?date=${today}`);
      setRecentOrders(res.data.orders.slice(0, 5));

    } catch (err) {
      console.error("Orders fetch failed:", err);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentOrders()]);
      setLoading(false);
    };

    initFetch();

    // 🔁 Auto-refresh every 30 seconds
    const interval = setInterval(initFetch, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentOrders()]);
    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Navbar />
        <div className="p-8">
          {/* Title and refresh */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              Dashboard Overview 👋
            </h1>
            <button
              onClick={handleRefresh}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-10 w-10 border-t-4 border-orange-500 rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Orders" value={stats.total_orders} />
                <StatCard title="Active Menu Items" value={stats.active_menu} />
              </div>

              {/* Recent Orders */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Recent Orders 🧾
                </h2>
                {recentOrders.length === 0 ? (
                  <p className="text-gray-600">No recent orders.</p>
                ) : (
                  <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-orange-100 text-gray-700 text-sm">
                        <tr>
                          <th className="p-3">Order No</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Payment</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentOrders.map((order) => (
                          <tr
                            key={order.order_no}
                            className="border-b hover:bg-orange-50 transition"
                          >
                            <td className="p-3 font-medium text-gray-800">
                              #{order.order_no}
                            </td>
                            <td className="p-3">{order.customer_name}</td>
                            <td className="p-3">₹{order.amount}</td>
                            <td className="p-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3">{order.payment_mode}</td>
                            <td className="p-3 text-gray-500">
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

// 🔸 Stat card component
const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
    <h3 className="text-gray-500 font-medium">{title}</h3>
    <p className="text-3xl font-bold text-orange-600 mt-2">{value}</p>
  </div>
);

// 🔸 Badge color based on order status
function getStatusBadge(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "preparing":
      return "bg-orange-100 text-orange-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-50 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default Dashboard;
