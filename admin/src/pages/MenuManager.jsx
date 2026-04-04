import React, { useEffect, useState } from "react";
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notice from "../components/Notice.jsx";

const emptyForm = { name: "", cost: "", category: "" };

const MenuManager = () => {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ message: "", tone: "info" });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/menu");
      setMenu(res.data || []);
      setNotice({ message: "", tone: "info" });
    } catch (err) {
      console.error("Menu fetch error:", err);
      setNotice({ message: "Failed to fetch menu.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editId) {
        await axios.put(`/menu/${editId}`, form);
      } else {
        await axios.post("/menu", form);
      }

      setForm(emptyForm);
      setEditId(null);
      setNotice({
        message: editId ? "Menu item updated successfully." : "Menu item added successfully.",
        tone: "success",
      });
      fetchMenu();
    } catch (err) {
      console.error("Menu save error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to save menu item.",
        tone: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(`/menu/${id}`);
      setNotice({ message: "Item deleted successfully.", tone: "success" });
      fetchMenu();
    } catch (err) {
      console.error("Menu delete error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to delete item.",
        tone: "error",
      });
    }
  };

  const toggleAvailability = async (id, current) => {
    try {
      await axios.patch(`/menu/${id}/availability`, { availability: !current });
      setNotice({
        message: `Item ${current ? "marked unavailable" : "made available"}.`,
        tone: "success",
      });
      fetchMenu();
    } catch (err) {
      console.error("Availability update error:", err);
      setNotice({ message: "Failed to update availability.", tone: "error" });
    }
  };

  const filteredMenu = menu.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    return searchMatch && categoryMatch;
  });

  const categories = ["all", ...new Set(menu.map((item) => item.category).filter(Boolean))];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
                Menu studio
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {editId ? "Edit menu item" : "Add a new menu item"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Keep the customer app up to date with accurate categories, pricing, and availability.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Item name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white"
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Price"
                    value={form.cost}
                    onChange={(event) => setForm({ ...form, cost: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white"
                    required
                  />

                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    {editId ? "Update item" : "Add item"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setForm(emptyForm);
                      }}
                      className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              <h3 className="text-2xl font-semibold">Menu health</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard value={menu.length} label="Total items" />
                <SummaryCard
                  value={menu.filter((item) => item.availability).length}
                  label="Currently available"
                />
                <SummaryCard
                  value={new Set(menu.map((item) => item.category)).size}
                  label="Active categories"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Menu list</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Toggle item availability instantly or jump into edit mode when details change.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search menu item..."
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Name</th>
                      <th className="px-3 py-3 font-medium">Category</th>
                      <th className="px-3 py-3 font-medium">Price</th>
                      <th className="px-3 py-3 font-medium">Available</th>
                      <th className="px-3 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenu.map((item) => (
                      <tr key={item.item_id} className="border-b border-slate-100 text-slate-700">
                        <td className="px-3 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-3 py-4">{item.category}</td>
                        <td className="px-3 py-4">₹{item.cost}</td>
                        <td className="px-3 py-4">
                          <button
                            onClick={() => toggleAvailability(item.item_id, item.availability)}
                            className="text-orange-600"
                            aria-label="Toggle availability"
                          >
                            {item.availability ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditId(item.item_id);
                                setForm({
                                  name: item.name,
                                  cost: item.cost,
                                  category: item.category,
                                });
                              }}
                              className="rounded-full bg-slate-100 p-2 text-blue-600 transition hover:bg-slate-200"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.item_id)}
                              className="rounded-full bg-slate-100 p-2 text-red-600 transition hover:bg-slate-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMenu.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-3 py-6 text-center text-slate-500">
                          No menu items match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const SummaryCard = ({ value, label }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
    <p className="text-3xl font-bold">{value}</p>
    <p className="mt-2 text-sm text-slate-300">{label}</p>
  </div>
);

export default MenuManager;
