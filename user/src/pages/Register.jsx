import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Flame,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/register", formData);
      toast.success("Account created! Welcome to FastFeast.");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] auth-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navigation */}
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-medium">
          <Zap size={13} className="text-brand-500" />
          <span>Quick 30s Signup</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-4xl my-auto py-8">
        <div className="grid lg:grid-cols-12 rounded-[2.5rem] bg-white border border-slate-200/80 shadow-card overflow-hidden">
          {/* Left Hero Sidebar */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-200 text-xs font-medium">
                <Flame size={14} className="text-brand-400" />
                <span>Join Campus Pre-orders</span>
              </div>

              <h2 className="mt-6 text-2xl sm:text-3xl font-display font-bold tracking-tight text-white leading-snug">
                Never wait in lunch queues again.
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Order between classes, get instant order readiness notifications, and pick up hot food seamlessly.
              </p>
            </div>

            <div className="relative z-10 mt-10 space-y-4 pt-6 border-t border-white/10">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                  <Sparkles size={14} />
                  <span>Student Benefits</span>
                </div>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span>Instant digital pickup counter token</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span>Secure UPI & NetBanking payments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span>Rate dishes & shape campus canteen menus</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Encrypted credentials & secure session</span>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Fast Registration</p>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
                  Create student account
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  Get started in 30 seconds to begin pre-ordering meals.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Campus / Personal Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. alex@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Minimum 6 characters"
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number <span className="text-slate-400 lowercase font-normal">(optional for SMS alerts)</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 px-4 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-brand-600 hover:text-brand-700 transition-colors underline-offset-4 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-2">
        <p className="text-xs text-slate-400">
          FastFeast Campus Express • By registering you agree to campus canteen order policies
        </p>
      </div>
    </div>
  );
};

export default Register;
