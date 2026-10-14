import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { normalizeOrders } from "../utils/orders";
import {
  Star,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Utensils,
  Award,
  ThumbsUp,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

const STAR_LABELS = {
  1: "Needs recipe revamp 😕",
  2: "Could be better 😐",
  3: "Standard canteen taste 🙂",
  4: "Really tasty! 😋",
  5: "Campus favorite! 🔥",
};

const QUICK_TAGS = [
  "⚡ Super fast pickup",
  "🔥 Piping hot & fresh",
  "😋 Delicious seasoning",
  "💰 Great student value",
  "📦 Neat packaging",
  "🌶️ Nice spice level",
];

const Feedback = () => {
  const [orders, setOrders] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
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

  const handleAddTag = (tag) => {
    if (content.includes(tag)) return;
    setContent((prev) => (prev ? `${prev} • ${tag}` : tag));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedItemId) {
      toast.error("Please choose a menu item from your past orders.");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write a short review or pick a quick tag.");
      return;
    }

    try {
      setSubmitting(true);
      // Include the star rating in the feedback text for richer backend logging
      const fullContent = `[${rating}/5 Stars] ${content.trim()}`;
      await axios.post("/feedback", {
        item_id: Number(selectedItemId),
        content: fullContent,
      });

      toast.success("Thank you! Your feedback helps improve the canteen.");
      setSelectedItemId("");
      setContent("");
      setRating(5);
    } catch (err) {
      console.error("Feedback submit error:", err);
      toast.error(err.response?.data?.message || "Failed to send feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRatingDisplay = hoverRating || rating;

  return (
    <div className="min-h-screen bg-[#fafafc] subtle-mesh pb-20">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-10 shadow-subtle">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600 border border-brand-200/60">
            <Sparkles size={14} />
            <span>Student Voice & Quality Ratings</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Rate your meals. Shape the campus menu.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Your reviews go straight to the canteen kitchen and admin team to optimize prep time, taste, and weekly food specials.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          {/* Left: Feedback Form */}
          <section className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-display font-bold text-slate-900">Leave Dish Feedback</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select any dish you have previously ordered and tell us how it was.
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin text-brand-500" size={32} />
                <p className="mt-3 text-xs text-slate-400">Loading your ordered dishes...</p>
              </div>
            ) : orderedItems.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                <Utensils className="mx-auto text-slate-400 mb-3" size={28} />
                <h3 className="text-sm font-bold text-slate-800">No ordered items yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                  Once you preorder and taste food from the canteen, you can rate and review them here.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Select Menu Item */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Which dish are you reviewing?
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                  >
                    <option value="">Choose a dish from your past orders...</option>
                    {orderedItems.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Star Rating */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= activeRatingDisplay;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                          aria-label={`${starVal} stars`}
                        >
                          <Star
                            size={28}
                            className={`transition-colors ${
                              isFilled
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-100 text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      {STAR_LABELS[activeRatingDisplay]}
                    </span>
                  </div>
                </div>

                {/* Quick Tag Pills */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Quick tags (tap to add)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Detailed Comments
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us about the portion size, flavor, preparation speed, temperature, or suggestions for the kitchen..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                  />
                  <div className="mt-1 flex justify-end">
                    <span className="text-[11px] text-slate-400">
                      {content.trim().length} / 500 characters
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedItemId}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 px-4 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-600 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending to Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Student Review</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          {/* Right: Context & Info Cards */}
          <aside className="space-y-5">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-300">
                <Award size={16} />
                <span>Impact on Canteen Menu</span>
              </div>
              <h3 className="mt-2 text-lg font-display font-bold text-white">
                How your ratings make a difference
              </h3>

              <div className="mt-5 space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-brand-300">
                    <ThumbsUp size={13} />
                  </div>
                  <p className="leading-relaxed">
                    <strong className="text-white">Flavor consistency:</strong> Kitchen staff reviews daily ratings to tweak seasoning, oil, and portion sizes.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
                    <Sparkles size={13} />
                  </div>
                  <p className="leading-relaxed">
                    <strong className="text-white">Menu availability:</strong> Highly rated dishes get larger prep batches so they don't sell out before lunch.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
                    <HeartHandshake size={13} />
                  </div>
                  <p className="leading-relaxed">
                    <strong className="text-white">Faster counter throughput:</strong> Feedback highlights bottlenecks so staff can speed up packaging.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Verified Preorders Only</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Only students who have purchased an item can leave feedback for it, keeping canteen ratings honest and authentic.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
