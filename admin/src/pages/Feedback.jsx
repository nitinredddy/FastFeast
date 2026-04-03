import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import Notice from "../components/Notice.jsx";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState({
    totals: { total_feedback: 0, items_covered: 0, customers_participated: 0 },
    topItems: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ message: "", tone: "info" });
  const [itemFilter, setItemFilter] = useState("all");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const [feedbackRes, summaryRes] = await Promise.all([
        axios.get("/feedback"),
        axios.get("/feedback/summary"),
      ]);

      setFeedback(feedbackRes.data || []);
      setSummary(summaryRes.data);
      setNotice({ message: "", tone: "info" });
    } catch (err) {
      console.error("Fetch feedback error:", err);
      setNotice({ message: "Failed to fetch feedback.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const itemOptions = useMemo(
    () => ["all", ...new Set(feedback.map((entry) => entry.item_name))],
    [feedback]
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return feedback.filter((entry) => {
      const searchMatch =
        normalizedSearch === "" ||
        entry.item_name.toLowerCase().includes(normalizedSearch) ||
        entry.user_name.toLowerCase().includes(normalizedSearch) ||
        entry.content.toLowerCase().includes(normalizedSearch);

      const itemMatch = itemFilter === "all" || entry.item_name === itemFilter;

      return searchMatch && itemMatch;
    });
  }, [feedback, itemFilter, search]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">Customer feedback</h2>
            <p className="mt-2 text-sm text-slate-500">
              Track what customers are saying, which items attract the most comments, and where to
              focus improvements.
            </p>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total feedback" value={summary.totals.total_feedback} tone="dark" />
                <StatCard label="Items covered" value={summary.totals.items_covered} />
                <StatCard label="Customers heard" value={summary.totals.customers_participated} />
                <StatCard label="Top discussed item" value={summary.topItems[0]?.item_name || "N/A"} />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <input
                      type="text"
                      placeholder="Search by item, user, or comment..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white lg:max-w-md"
                    />

                    <div className="flex gap-3">
                      <select
                        value={itemFilter}
                        onChange={(event) => setItemFilter(event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      >
                        {itemOptions.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? "All items" : item}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={fetchFeedback}
                        className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-3 py-3 font-medium">Item</th>
                          <th className="px-3 py-3 font-medium">Customer</th>
                          <th className="px-3 py-3 font-medium">Feedback</th>
                          <th className="px-3 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-3 py-6 text-center text-slate-500">
                              No feedback matches the current filters.
                            </td>
                          </tr>
                        ) : (
                          filtered.map((entry) => (
                            <tr
                              key={entry.feedback_id}
                              className="border-b border-slate-100 text-slate-700"
                            >
                              <td className="px-3 py-4 font-medium text-slate-900">{entry.item_name}</td>
                              <td className="px-3 py-4">{entry.user_name}</td>
                              <td className="px-3 py-4 max-w-xl">{entry.content}</td>
                              <td className="px-3 py-4 text-slate-500">
                                {new Date(entry.feedback_date).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
                    <h3 className="text-xl font-semibold">Top discussed items</h3>
                    <div className="mt-5 space-y-3">
                      {summary.topItems.length === 0 ? (
                        <p className="text-sm text-slate-300">No feedback yet.</p>
                      ) : (
                        summary.topItems.map((item, index) => (
                          <div
                            key={item.item_name}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
                                Rank {index + 1}
                              </p>
                              <p className="mt-1 font-medium">{item.item_name}</p>
                            </div>
                            <span className="text-sm font-semibold">{item.feedback_count}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Recent activity</h3>
                    <div className="mt-5 space-y-3">
                      {summary.recentActivity.length === 0 ? (
                        <p className="text-sm text-slate-500">No activity yet.</p>
                      ) : (
                        summary.recentActivity.map((day) => (
                          <div
                            key={day.feedback_day}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                          >
                            <span className="text-sm text-slate-600">
                              {new Date(day.feedback_day).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{day.entries}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, tone = "light" }) => (
  <div
    className={`rounded-3xl p-5 shadow-sm ${
      tone === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}
  >
    <p className={`text-sm font-medium ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>{label}</p>
    <p className="mt-3 text-3xl font-bold">{value}</p>
  </div>
);

export default Feedback;
