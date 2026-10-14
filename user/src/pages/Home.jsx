import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Search,
  ShoppingCart,
  Sparkles,
  Flame,
  Utensils,
  Coffee,
  Sandwich,
  Pizza,
  IceCream,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { getCartCount, getCart, saveCart } from "../utils/cart";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICONS = {
  All: <Sparkles size={14} />,
  Breakfast: <Utensils size={14} />,
  Lunch: <Pizza size={14} />,
  Snacks: <Sandwich size={14} />,
  Beverages: <Coffee size={14} />,
  Desserts: <IceCream size={14} />,
};

const Home = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(getCart());
  const [cartCount, setCartCount] = useState(getCartCount());

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

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.cost || 0) * item.quantity, 0);
  }, [cartItems]);

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const isVeg = !item.name.toLowerCase().includes("chicken") &&
                    !item.name.toLowerCase().includes("egg") &&
                    !item.name.toLowerCase().includes("fish") &&
                    !item.name.toLowerCase().includes("meat");
      const matchesVeg = !vegOnly || isVeg;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [category, menu, search, vegOnly]);

  const getItemQuantityInCart = (itemId) => {
    const found = cartItems.find((ci) => ci.item_id === itemId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (item) => {
    if (!item.availability) {
      toast.error("This item is currently sold out.");
      return;
    }

    const currentCart = getCart();
    const existing = currentCart.find((ci) => ci.item_id === item.item_id);

    let updatedCart;
    if (existing) {
      updatedCart = currentCart.map((ci) =>
        ci.item_id === item.item_id ? { ...ci, quantity: ci.quantity + 1 } : ci
      );
    } else {
      updatedCart = [...currentCart, { ...item, quantity: 1 }];
    }

    saveCart(updatedCart);
    setCartItems(updatedCart);
    setCartCount(getCartCount());
    toast.success(`${item.name} added to tray`);
  };

  const handleUpdateQuantity = (itemId, delta) => {
    const currentCart = getCart();
    const updatedCart = currentCart
      .map((ci) => {
        if (ci.item_id === itemId) {
          const newQty = ci.quantity + delta;
          return newQty > 0 ? { ...ci, quantity: newQty } : null;
        }
        return ci;
      })
      .filter(Boolean);

    saveCart(updatedCart);
    setCartItems(updatedCart);
    setCartCount(getCartCount());
  };

  return (
    <div className="min-h-screen bg-[#fafafc] subtle-mesh pb-24">
      <Navbar cartCount={cartCount} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-8 sm:p-12 text-white shadow-card">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-1/4 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-200 border border-white/10 backdrop-blur-md">
                <Flame size={14} className="text-brand-400" />
                <span>Central Campus Canteen • Live Preorders</span>
              </div>

              <h1 className="mt-4 text-3xl font-display font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight">
                Order before the bell rings. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-200 to-white">
                  Pick up without the crowd.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Freshly cooked meals, snacks, and drinks prepared for your break. Place your order now, grab your digital token, and collect right at the express counter.
              </p>

              {/* Feature Chips */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-slate-200 border border-white/10 backdrop-blur-sm">
                  <Clock3 size={14} className="text-brand-300" />
                  <span>~8-12 min counter ready</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-slate-200 border border-white/10 backdrop-blur-sm">
                  <ShieldCheck size={14} className="text-emerald-300" />
                  <span>Verified canteen kitchen</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-slate-200 border border-white/10 backdrop-blur-sm">
                  <Zap size={14} className="text-amber-300" />
                  <span>Zero queue token system</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Available Today</p>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="mt-2 text-2xl font-bold font-display text-white">
                  {menu.filter((i) => i.availability).length} <span className="text-xs font-normal text-slate-400">/ {menu.length} items</span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Current Tray</p>
                  <ShoppingCart size={15} className="text-brand-300" />
                </div>
                <p className="mt-2 text-2xl font-bold font-display text-white">
                  {cartCount} <span className="text-xs font-normal text-slate-400">items • ₹{cartTotal.toFixed(0)}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-subtle">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search dosas, rolls, noodles, coffee, snacks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Veg Toggle & Categories */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  vegOnly
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="veg-badge scale-75" />
                <span>Veg Only</span>
                {vegOnly && <Check size={13} className="text-emerald-700" />}
              </button>

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      category === cat
                        ? "bg-slate-900 text-white shadow-subtle"
                        : "bg-slate-100/80 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Menu Grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-display font-bold text-slate-900">
              {category === "All" ? "Today's Full Menu" : `${category} Selection`}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
              <p className="mt-4 text-xs font-medium text-slate-500">Fetching live canteen menu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-subtle">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                <Utensils size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching dishes found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try searching for something else or switch to another category.
              </p>
              <button
                onClick={() => {
                  setCategory("All");
                  setSearch("");
                  setVegOnly(false);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-subtle transition hover:bg-slate-800"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const isVeg = !item.name.toLowerCase().includes("chicken") &&
                              !item.name.toLowerCase().includes("egg") &&
                              !item.name.toLowerCase().includes("fish") &&
                              !item.name.toLowerCase().includes("meat");
                const qtyInCart = getItemQuantityInCart(item.item_id);
                const isBudget = Number(item.cost) <= 50;

                return (
                  <article
                    key={item.item_id}
                    className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:shadow-card ${
                      item.availability ? "border-slate-200/80" : "border-slate-200/60 bg-slate-50/50 opacity-75"
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={isVeg ? "veg-badge" : "non-veg-badge"} title={isVeg ? "Vegetarian" : "Non-Vegetarian"} />
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            {item.category}
                          </span>
                          {isBudget && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              🎓 Pocket Friendly
                            </span>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            item.availability
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.availability ? "In Stock" : "Sold Out"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="mt-3.5 text-lg font-display font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                        Prepared fresh on order at the central canteen kitchen.
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock3 size={13} />
                          <span>~8-12 min prep</span>
                        </span>
                        <span>•</span>
                        <span>Hot pickup</span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action Row */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Price</p>
                        <p className="text-2xl font-bold font-display text-slate-900">
                          ₹{Number(item.cost).toFixed(0)}
                        </p>
                      </div>

                      {item.availability ? (
                        qtyInCart > 0 ? (
                          <div className="flex items-center gap-2 rounded-2xl bg-brand-50 border border-brand-200/80 p-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.item_id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-800 shadow-xs hover:bg-brand-500 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-6 text-center text-xs font-bold text-brand-900">
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.item_id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs hover:bg-brand-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-subtle transition-all hover:bg-brand-500 active:scale-95"
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Bottom Quick Cart Bar (appears when items are in cart) */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-30 px-4 pointer-events-none animate-fadeIn">
          <div className="mx-auto max-w-2xl pointer-events-auto">
            <div className="flex items-center justify-between rounded-full bg-slate-900/95 backdrop-blur-xl border border-white/20 px-5 py-3 text-white shadow-2xl transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-xs shadow-glow">
                  {cartCount}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {cartCount} {cartCount === 1 ? "item" : "items"} selected
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Subtotal: <span className="font-semibold text-white">₹{cartTotal.toFixed(0)}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/cart")}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-glow transition hover:bg-brand-600 active:scale-95"
              >
                <span>View Tray & Pay</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
