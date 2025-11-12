import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { ShoppingCart, Search } from "lucide-react";
import toast from "react-hot-toast";

const Home = () => {
  const [menu, setMenu] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ this will track the live cart count
  const [cartCount, setCartCount] = useState(
    JSON.parse(localStorage.getItem("fastfeast-cart"))?.length || 0
  );

  const categories = ["All", "Breakfast", "Lunch", "Snacks", "Beverages"];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/menu");
      setMenu(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    filterMenu(value, category);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    filterMenu(search, cat);
  };

  const filterMenu = (searchText, cat) => {
    let filteredItems = menu;

    if (cat !== "All") {
      filteredItems = filteredItems.filter((i) => i.category === cat);
    }

    if (searchText.trim() !== "") {
      filteredItems = filteredItems.filter((i) =>
        i.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFiltered(filteredItems);
  };

  // ✅ FIXED: Store cart in localStorage + update Navbar count
  const addToCart = (item) => {
    if (!item.availability) {
      toast.error("Sorry, this item is currently unavailable.");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("fastfeast-cart")) || [];

    const exists = existingCart.find((c) => c.item_id === item.item_id);
    let updatedCart;

    if (exists) {
      updatedCart = existingCart.map((c) =>
        c.item_id === item.item_id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      updatedCart = [...existingCart, { ...item, quantity: 1 }];
    }

    localStorage.setItem("fastfeast-cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.length);
    toast.success(`${item.name} added to cart 🛒`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Pass live cartCount */}
      <Navbar cartCount={cartCount} />

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🍽️ FastFeast Menu</h1>

        {/* Search + Filter Section */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-t-4 border-orange-500 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-lg">
            No items found 🍛
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{item.category}</p>
                <p className="text-orange-600 font-semibold text-lg">₹{item.cost}</p>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.availability
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.availability ? "Available" : "Unavailable"}
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      item.availability
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!item.availability}
                  >
                    <ShoppingCart size={16} />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
