import React, { useState } from "react";
import axios from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, UtensilsCrossed } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/auth/login", form);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials or unauthorized role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafc] px-4 py-12"
      style={{
        backgroundImage: `radial-gradient(at 15% 15%, rgba(255, 94, 54, 0.08) 0px, transparent 40%), radial-gradient(at 85% 85%, rgba(15, 23, 42, 0.06) 0px, transparent 50%)`
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-card">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-orange-400 shadow-subtle mb-4">
            <UtensilsCrossed size={26} />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <ShieldCheck size={14} className="text-brand-500" />
            <span>Staff & Admin Console</span>
          </div>
          <h1 className="mt-3 text-2xl font-display font-bold text-slate-900">
            FastFeast Operations
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Sign in to manage kitchen orders, live availability, and payments.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Staff Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="admin@fastfeast.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 px-4 text-sm font-semibold text-white shadow-subtle transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Restricted to authorized canteen managers and counter operators.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
