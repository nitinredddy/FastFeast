import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notice from "../components/Notice.jsx";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ message: "", tone: "info" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/menu");
      setItems(res.data || []);
      setNotice({ message: "", tone: "info" });
    } catch (err) {
      console.error("Availability fetch error:", err);
      setNotice({ message: "Failed to fetch menu availability.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentValue) => {
    try {
      await axios.patch(`/menu/${itemId}/availability`, {
        availability: !currentValue,
      });
      setNotice({
        message: `Item ${currentValue ? "marked unavailable" : "made available"}.`,
        tone: "success",
      });
      fetchMenu();
    } catch (err) {
      console.error("Toggle availability error:", err);
      setNotice({ message: "Failed to update availability.", tone: "error" });
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">Availability control</h2>
            <p className="mt-2 text-sm text-slate-500">
              Turn menu items on or off so customers only see what can be ordered right now.
            </p>
          </section>

          <section className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item..."
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white lg:w-80"
            />
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
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
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
                        <button
                          onClick={() => toggleAvailability(item.item_id, item.availability)}
                          className="rounded-full bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                        >
                          {item.availability ? "Mark unavailable" : "Make available"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                        No menu items match the current search.
                      </td>
                    </tr>
                  )}
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
