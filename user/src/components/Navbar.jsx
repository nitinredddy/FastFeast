import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  ShoppingCart,
  X,
  Flame,
  UtensilsCrossed,
  Clock,
  Sparkles,
  User,
} from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { clearCart, getCartCount, subscribeToCart } from "../utils/cart";

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [derivedCartCount, setDerivedCartCount] = useState(getCartCount());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const visibleCartCount = cartCount ?? derivedCartCount;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => subscribeToCart(setDerivedCartCount), []);

  useEffect(() => {
    let ignore = false;

    axios
      .get("/auth/verify")
      .then((res) => {
        if (!ignore) {
          const isValid = res.data?.valid && res.data?.user?.role === "customer";
          setIsAuthenticated(isValid);
          if (isValid && res.data?.user) {
            setUserData(res.data.user);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsAuthenticated(false);
          setUserData(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      clearCart();
      setIsAuthenticated(false);
      setUserData(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  const navigateToLogin = (redirectTo = location.pathname, resumeCheckout = false) => {
    navigate("/login", {
      state: {
        redirectTo,
        resumeCheckout,
      },
    });
  };

  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated && (path === "/orders" || path === "/feedback")) {
      navigateToLogin(path);
      return;
    }
    navigate(path);
  };

  const navItems = [
    { label: "Menu", path: "/home", icon: <UtensilsCrossed size={16} /> },
    { label: "My Orders", path: "/orders", icon: <Clock size={16} /> },
    { label: "Feedback", path: "/feedback", icon: <MessageSquareText size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-glow transition-transform group-hover:scale-105">
            <Flame size={20} className="fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                FastFeast
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-brand-50 text-brand-700 border border-brand-200/60">
                Campus Hub
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Express Canteen Pickup</p>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center rounded-full bg-slate-100/80 p-1 border border-slate-200/50">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleProtectedNavigation(item.path)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-white text-slate-900 shadow-subtle"
                      : "text-slate-600 hover:text-brand-600"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className={`relative flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              visibleCartCount > 0
                ? "border-brand-300 bg-brand-50/60 text-brand-700 hover:bg-brand-100/60 shadow-subtle"
                : "border-slate-200/80 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            <ShoppingCart size={16} />
            <span>Cart</span>
            {visibleCartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white shadow-xs">
                {visibleCartCount}
              </span>
            )}
          </button>

          {/* User / Auth status */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-subtle">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={12} />}
                </div>
                <span className="font-medium max-w-[90px] truncate">{userData?.name || "Student"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-rose-600"
                title="Log out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateToLogin()}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-subtle transition-all hover:bg-slate-800 active:scale-95"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-subtle"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {visibleCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                {visibleCartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-subtle"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown drawer */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl md:hidden animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleProtectedNavigation(item.path)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  location.pathname === item.path
                    ? "bg-brand-500 text-white shadow-glow"
                    : "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2.5">
                <ShoppingCart size={18} />
                <span>My Preorder Tray</span>
              </span>
              {visibleCartCount > 0 && (
                <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {visibleCartCount} items
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => navigateToLogin()}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-subtle"
              >
                <LogIn size={16} />
                <span>Student Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
