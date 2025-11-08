// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";

const Navbar = ({ cartCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      toast.success("Logged out successfully 👋");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="flex justify-between items-center bg-white shadow-md px-8 py-4">
      {/* 🍽️ Brand */}
      <h1
        className="text-2xl font-bold text-orange-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        FastFeast
      </h1>

      {/* 🧭 Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/orders")}
          className="text-gray-700 hover:text-orange-500 transition font-medium"
        >
          My Orders
        </button>

        <button
          onClick={() => navigate("/feedback")}
          className="text-gray-700 hover:text-orange-500 transition font-medium"
        >
          Feedback
        </button>

        {/* 🛒 Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="relative flex items-center text-gray-700 hover:text-orange-500 transition"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        {/* 🚪 Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
