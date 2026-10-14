import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/login", formData);
      toast.success("Welcome back to FastFeast!");
      const redirectTo = location.state?.redirectTo || "/home";
      navigate(redirectTo, {
        replace: true,
        state: {
          loginJustSucceeded: true,
          resumeCheckout: Boolean(location.state?.resumeCheckout),
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] auth-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Central Canteen Active</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-4xl my-auto py-8">
        <div className="grid lg:grid-cols-12 rounded-[2.5rem] bg-white border border-slate-200/80 shadow-card overflow-hidden">
          {/* Left Student Showcase Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-200 text-xs font-medium">
                <Flame size={14} className="text-brand-400" />
                <span>FastFeast Campus</span>
              </div>

              <h2 className="mt-6 text-2xl sm:text-3xl font-display font-bold tracking-tight text-white leading-snug">
                Your meals ready before your lecture ends.
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Skip the crowded 20-minute break lines. Preorder directly to the canteen kitchen and pick up with your digital token.
              </p>
            </div>

            <div className="relative z-10 mt-10 space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-brand-300">
                  <Clock size={14} />
                </div>
                <span>5-minute priority counter collection</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
                  <Sparkles size={14} />
                </div>
                <span>Live availability & kitchen order tracker</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
                  <CheckCircle2 size={14} />
                </div>
                <span>Zero service fees for campus students</span>
              </div>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Student Portal</p>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
                  Sign in to your account
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Enter your campus credentials to continue your preorder.
                </p>
              </div>

              {location.state?.resumeCheckout && (
                <div className="mb-6 rounded-2xl bg-brand-50 border border-brand-200/80 p-4 flex items-start gap-3">
                  <Sparkles size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-brand-900">Cart saved!</p>
                    <p className="text-xs text-brand-700 mt-0.5">
                      Log in to immediately proceed with your Razorpay checkout.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. student@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 px-4 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  New student to FastFeast?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-brand-600 hover:text-brand-700 transition-colors underline-offset-4 hover:underline"
                  >
                    Create student account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-400">
          FastFeast Campus Express • Designed for student food preorders
        </p>
      </div>
    </div>
  );
};

export default Login;
