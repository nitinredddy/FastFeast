import React from "react";
import { Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white shadow flex justify-between items-center px-6 py-3">
      <h1 className="text-lg font-semibold text-orange-600">FastFeast Admin Panel</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-orange-100">
          <Bell size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <User size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700 font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
