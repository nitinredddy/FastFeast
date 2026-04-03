import React from "react";
import { Bell, CalendarDays, User } from "lucide-react";

const Navbar = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">FastFeast Admin Panel</h1>
          <p className="text-sm text-slate-500">Service operations, menu control, and order flow.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
            <CalendarDays size={16} className="text-orange-500" />
            {today}
          </div>

          <button className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            <User size={16} />
            Operations
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
