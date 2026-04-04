import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { normalizeOrders } from "../utils/orders";

const Feedback = () => {
  const [orders, setOrders] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/orders/user");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Feedback order history fetch error:", err);
        toast.error("Unable to load your past orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const normalizedOrders = useMemo(() => normalizeOrders(orders), [orders]);

  const orderedItems = useMemo(() => {
    const seen = new Map();

    normalizedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!seen.has(item.item_id)) {
          seen.set(item.item_id, item.name);
        }
      });
    });

    return Array.from(seen.entries()).map(([item_id, name]) => ({ item_id, name }));
  }, [normalizedOrders]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedItemId || !content.trim()) {
      toast.error("Choose an item and write a short review.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("/feedback", {
        item_id: Number(selectedItemId),
        content: content.trim(),
      });

      toast.success("Thanks for the feedback.");
      setSelectedItemId("");
      setContent("");
    } catch (err) {
      console.error("Feedback submit error:", err);
      toast.error(err.response?.data?.message || "Failed to send feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_35%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_48%,_#fffaf5_100%)]">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(251,146,60,0.45)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
            Customer Voice
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Help us make FastFeast faster and tastier.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Share feedback on items you have already ordered so the kitchen team can improve the
            menu and service quality.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Leave feedback</h2>
            <p className="mt-2 text-sm text-slate-500">
              Pick an item from your previous orders and tell us what worked or what should change.
            </p>

            {loading ? (
              <div className="mt-8 flex justify-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              </div>
            ) : orderedItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                Place an order first and you’ll be able to review the items here.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Menu item</span>
                  <select
                    value={selectedItemId}
                    onChange={(event) => setSelectedItemId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Select an item</option>
                    {orderedItems.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Feedback</span>
                  <textarea
                    rows="6"
                    maxLength={500}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Tell us about taste, waiting time, packaging, portion size, or anything else."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">{content.trim().length}/500 characters</p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? "Submitting..." : "Send feedback"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">What the team can improve with your input</h2>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Taste and quality",
                  body: "Spot dishes that need recipe tweaks, better consistency, or fresher ingredients.",
                },
                {
                  title: "Pickup experience",
                  body: "Highlight delays, crowding, or confusion around order readiness and collection.",
                },
                {
                  title: "Menu planning",
                  body: "Help identify popular items, weak performers, and what should be available more often.",
                },
              ].map((section) => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
