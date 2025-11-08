import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "../api/axios";

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/feedback");
      setFeedback(res.data);
    } catch (err) {
      console.error("Fetch feedback error:", err);
      alert("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const filtered = feedback.filter(
    (f) =>
      f.item_name.toLowerCase().includes(search.toLowerCase()) ||
      f.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Navbar />
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Customer Feedback 💬</h2>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by item or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 rounded-lg w-1/3 focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <button
              onClick={fetchFeedback}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-t-4 border-orange-500 rounded-full" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Feedback</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-gray-500 p-4">
                        No feedback yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f) => (
                      <tr
                        key={f.feedback_id}
                        className="border-b hover:bg-orange-50 transition"
                      >
                        <td className="p-3 font-medium text-gray-800">
                          {f.item_name}
                        </td>
                        <td className="p-3 text-gray-600">{f.user_name}</td>
                        <td className="p-3 text-gray-700">{f.content}</td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(f.feedback_date).toLocaleString()}
                        </td>
                      </tr>
                    ))
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

export default Feedback;
