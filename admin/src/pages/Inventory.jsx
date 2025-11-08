import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/menu");
      setItems(res.data);
    } catch (err) {
      console.error("Fetch menu error:", err);
      alert("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (item_id, currentValue) => {
    try {
      await axios.patch(`/menu/${item_id}/availability`, {
        availability: !currentValue,
      });
      fetchMenu(); // Refresh list
    } catch (err) {
      console.error("Toggle availability error:", err);
      alert("Failed to update item availability");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Navbar />
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Menu Availability ⚙️</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-t-4 border-orange-500 rounded-full" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-orange-100">
                    <th className="p-3">Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3 text-center">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No menu items found.
                      </td>
                    </tr>
                  )}

                  {items.map((it) => (
                    <tr
                      key={it.item_id}
                      className="border-b hover:bg-orange-50 transition"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {it.name}
                      </td>
                      <td className="p-3 text-gray-600">{it.category}</td>
                      <td className="p-3 text-gray-700">{it.price}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            toggleAvailability(it.item_id, it.availability)
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            it.availability
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {it.availability ? "Available" : "Unavailable"}
                        </button>
                      </td>
                    </tr>
                  ))}
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
