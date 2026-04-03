import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, MessageSquareText, ShoppingCart, X } from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { clearCart, getCartCount, subscribeToCart } from "../utils/cart";

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [derivedCartCount, setDerivedCartCount] = useState(getCartCount());

  const visibleCartCount = cartCount ?? derivedCartCount;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => subscribeToCart(setDerivedCartCount), []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      clearCart();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { label: "Menu", path: "/home" },
    { label: "My Orders", path: "/orders" },
    { label: "Feedback", path: "/feedback" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button className="text-left" onClick={() => navigate("/home")}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
            FastFeast
          </p>
          <h1 className="text-lg font-bold text-slate-900">Preorder and pickup</h1>
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
          >
            <ShoppingCart size={18} />
            Cart
            {visibleCartCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                {visibleCartCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen((current) => !current)}
          className="rounded-full border border-slate-200 p-2 text-slate-700 md:hidden"
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  location.pathname === item.path
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={16} />
                Cart
              </span>
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                {visibleCartCount}
              </span>
            </button>

            <button
              onClick={() => navigate("/feedback")}
              className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <MessageSquareText size={16} />
              Share feedback
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
