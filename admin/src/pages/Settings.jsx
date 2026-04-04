import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notice from "../components/Notice.jsx";

const Settings = () => {
  const [settings, setSettings] = useState({
    ordering_enabled: true,
    payments_enabled: true,
    open_hour_start: 8,
    open_hour_end: 22,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ message: "", tone: "info" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/settings");
      setSettings({
        ordering_enabled: Boolean(res.data.ordering_enabled),
        payments_enabled: Boolean(res.data.payments_enabled),
        open_hour_start: Number(res.data.open_hour_start),
        open_hour_end: Number(res.data.open_hour_end),
      });
      setNotice({ message: "", tone: "info" });
    } catch (err) {
      console.error("Settings fetch error:", err);
      setNotice({ message: "Failed to load business settings.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const res = await axios.patch("/admin/settings", settings);
      setSettings({
        ordering_enabled: Boolean(res.data.settings.ordering_enabled),
        payments_enabled: Boolean(res.data.settings.payments_enabled),
        open_hour_start: Number(res.data.settings.open_hour_start),
        open_hour_end: Number(res.data.settings.open_hour_end),
      });
      setNotice({ message: "Business settings updated successfully.", tone: "success" });
    } catch (err) {
      console.error("Settings update error:", err);
      setNotice({
        message: err.response?.data?.message || "Failed to update business settings.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-4 sm:p-6 lg:p-8">
          <Notice message={notice.message} tone={notice.tone} />

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">Business settings</h2>
            <p className="mt-2 text-sm text-slate-500">
              Control ordering availability, payment availability, and daily canteen hours.
            </p>
          </section>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-2">
                <ToggleCard
                  title="Ordering"
                  description="Disable this to stop new preorders without shutting down the dashboard."
                  checked={settings.ordering_enabled}
                  onChange={(checked) =>
                    setSettings((current) => ({ ...current, ordering_enabled: checked }))
                  }
                />
                <ToggleCard
                  title="Online payments"
                  description="Disable this if Razorpay should be temporarily unavailable."
                  checked={settings.payments_enabled}
                  onChange={(checked) =>
                    setSettings((current) => ({ ...current, payments_enabled: checked }))
                  }
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Open hour</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={settings.open_hour_start}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        open_hour_start: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full bg-transparent text-sm outline-none"
                  />
                </label>

                <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Close hour</span>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={settings.open_hour_end}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        open_hour_end: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full bg-transparent text-sm outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

const ToggleCard = ({ title, description, checked, onChange }) => (
  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          checked ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
        }`}
      >
        {checked ? "Enabled" : "Disabled"}
      </button>
    </div>
  </div>
);

export default Settings;
