// src/components/CartItem.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-500 text-sm">{item.category}</p>
        <p className="text-orange-600 font-semibold mt-1">₹{item.cost}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onDecrease(item.item_id)}
          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200"
        >
          −
        </button>
        <span className="font-semibold">{item.quantity}</span>
        <button
          onClick={() => onIncrease(item.item_id)}
          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200"
        >
          +
        </button>

        <button
          onClick={() => onRemove(item.item_id)}
          className="text-red-500 hover:text-red-700 ml-3"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
