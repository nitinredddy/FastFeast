// src/components/CartItem.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
        <p className="text-sm text-slate-500">{item.category}</p>
        <p className="mt-2 text-sm font-semibold text-orange-600">
          ₹{item.cost} each
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-3 rounded-full bg-slate-100 px-2 py-1">
        <button
          onClick={() => onDecrease(item.item_id)}
            className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          −
        </button>
          <span className="min-w-6 text-center font-semibold text-slate-900">{item.quantity}</span>
        <button
          onClick={() => onIncrease(item.item_id)}
            className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          +
        </button>
        </div>

        <button
          onClick={() => onRemove(item.item_id)}
          className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
