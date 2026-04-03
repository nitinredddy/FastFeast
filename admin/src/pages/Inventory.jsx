import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/inventory");
      setItems(res.data || []);
      setDrafts(
        Object.fromEntries((res.data || []).map((item) => [item.item_id, item.stock_quantity]))
      );
    } catch (err) {
      console.error("Inventory fetch error:", err);
      alert("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId) => {
    try {
      await axios.patch(`/inventory/${itemId}`, {
        stock_quantity: Number(drafts[itemId]),
      });
      fetchInventory();
    } catch (err) {
      console.error("Stock update error:", err);
      alert(err.response?.data?.message || "Failed to update stock");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">Inventory and availability</h2>
            <p className="mt-2 text-sm text-slate-500">
              Track stock levels, spot low inventory, and keep the live menu accurate.
            </p>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Availability</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Last Updated</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLowStock = Number(item.stock_quantity) <= 10;

                    return (
                      <tr key={item.item_id} className="border-b border-slate-100 text-slate-700">
                        <td className="px-4 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-4">{item.category}</td>
                        <td className="px-4 py-4">₹{item.cost}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.availability
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {item.availability ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              value={drafts[item.item_id] ?? item.stock_quantity}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [item.item_id]: event.target.value,
                                }))
                              }
                              className={`w-24 rounded-2xl border px-3 py-2 outline-none ${
                                isLowStock
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            />
                            {isLowStock && (
                              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {new Date(item.last_updated).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => updateStock(item.item_id)}
                            className="rounded-full bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;
