import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isVeg = !item.name.toLowerCase().includes("chicken") &&
                !item.name.toLowerCase().includes("egg") &&
                !item.name.toLowerCase().includes("fish") &&
                !item.name.toLowerCase().includes("meat");

  const lineTotal = Number(item.cost || 0) * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-subtle transition-all hover:border-slate-300">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <span className={isVeg ? "veg-badge" : "non-veg-badge"} title={isVeg ? "Vegetarian" : "Non-Vegetarian"} />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-slate-900">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{item.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-brand-600">₹{item.cost} each</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 border border-slate-200/60">
          <button
            onClick={() => onDecrease(item.item_id)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs transition hover:bg-slate-200/60 active:scale-95"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-7 text-center text-xs font-bold text-slate-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrease(item.item_id)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs transition hover:bg-slate-200/60 active:scale-95"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Line Total */}
        <div className="min-w-16 text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-base font-bold font-display text-slate-900">₹{lineTotal.toFixed(0)}</p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.item_id)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-transparent text-slate-400 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          title="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
