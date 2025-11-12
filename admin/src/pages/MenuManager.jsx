import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const MenuManager = () => {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({ name: "", cost: "", category: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const res = await axios.get("/menu");
    setMenu(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cost) return;

    if (editId) {
      await axios.put(`/menu/${editId}`, form);
    } else {
      await axios.post("/menu", form);
    }

    setForm({ name: "", cost: "", category: "" });
    setEditId(null);
    fetchMenu();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await axios.delete(`/menu/${id}`);
      fetchMenu();
    }
  };

  const toggleAvailability = async (id, current) => {
    await axios.patch(`/menu/${id}/availability`, { availability: !current });
    fetchMenu();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manage Menu 🍽️</h2>
          <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg p-2 flex-1"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="border rounded-lg p-2 w-32"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg p-2"
            >
              <option value="">Select Category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
              <option value="Desserts">Desserts</option>
            </select>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {editId ? "Update" : "Add"}
            </button>
          </form>

          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-orange-100">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-center">Available</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.item_id} className="border-b">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">₹{item.cost}</td>
                  <td className="text-center">
                    <button
                      onClick={() => toggleAvailability(item.item_id, item.availability)}
                      className="text-orange-600"
                    >
                      {item.availability ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => setEditId(item.item_id) || setForm(item)}
                      className="text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {menu.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MenuManager;
