import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Search, ShoppingCart, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const Home = () => {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(
    JSON.parse(localStorage.getItem("fastfeast-cart"))?.length || 0
  );

  const categories = ["All", "Breakfast", "Lunch", "Snacks", "Beverages", "Desserts"];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/menu");
      setMenu(res.data || []);
    } catch (err) {
      console.error("Error fetching menu:", err);
      toast.error("Failed to load the menu.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, menu, search]);

  const addToCart = (item) => {
    if (!item.availability) {
      toast.error("This item is currently unavailable.");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("fastfeast-cart")) || [];
    const existingItem = existingCart.find((cartItem) => cartItem.item_id === item.item_id);

    const updatedCart = existingItem
      ? existingCart.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      : [...existingCart, { ...item, quantity: 1 }];

    localStorage.setItem("fastfeast-cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.length);
    toast.success(`${item.name} added to cart.`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_30%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_42%,_#f8fafc_100%)]">
      <Navbar cartCount={cartCount} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.7)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-300">
                Smart campus pickup
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                Skip the queue and preorder your next meal in minutes.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Browse the live menu, reserve what you want, and track your order from kitchen
                queue to pickup counter.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <FeaturePill icon={<Clock3 size={16} />} label="Faster pickup windows" />
                <FeaturePill icon={<Sparkles size={16} />} label="Live availability" />
                <FeaturePill icon={<ShoppingCart size={16} />} label="Simple reorder flow" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <HighlightCard value={menu.length} label="Menu items today" />
              <HighlightCard
                value={menu.filter((item) => item.availability).length}
                label="Available right now"
              />
              <HighlightCard value={cartCount} label="Items in cart" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === cat
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No dishes found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article
                  key={item.item_id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.availability
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.availability ? "Available" : "Sold out"}
                    </span>
                  </div>

                  <p className="mt-5 text-3xl font-bold text-slate-900">₹{item.cost}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Freshly prepared for quick pickup. Order now while availability lasts.
                  </p>

                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.availability}
                    className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      item.availability
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const FeaturePill = ({ icon, label }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100">
    {icon}
    {label}
  </div>
);

const HighlightCard = ({ value, label }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-300">{label}</p>
  </div>
);

export default Home;
