import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Package,
  MessageSquare,
  LogOut,
  Settings,
} from "lucide-react";
import axios from "../api/axios.js";
import Notice from "./Notice.jsx";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = React.useState("");

  const logout = async () => {
    try {
      await axios.post("/auth/logout"); // ✅ removed /api prefix
      setNotice("");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setNotice("Failed to logout. Please try again.");
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Menu", path: "/menu", icon: <Utensils size={20} /> },
    { name: "Orders", path: "/orders", icon: <ClipboardList size={20} /> },
    { name: "Availability", path: "/inventory", icon: <Package size={20} /> },
    { name: "Feedback", path: "/feedback", icon: <MessageSquare size={20} /> }, // ✅ Added feedback
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-5 flex flex-col">
      {/* Logo / Title */}
      <h2 className="text-2xl font-bold text-orange-600 mb-8 tracking-tight">
        FastFeast Admin
      </h2>

      <Notice message={notice} />

      {/* Navigation Items */}
      <nav className="mt-4 flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150 font-medium ${
                active
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-orange-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-150"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
