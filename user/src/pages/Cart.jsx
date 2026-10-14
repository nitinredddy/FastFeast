import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { clearCart, getCart, saveCart } from "../utils/cart";
import { loadRazorpayScript } from "../utils/razorpay";
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  ChevronRight,
  Flame,
} from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(getCart());
  const [pickupTime, setPickupTime] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    if (location.state?.loginJustSucceeded) {
      toast.success(
        location.state?.resumeCheckout
          ? "Logged in. You can now complete your checkout."
          : "Logged in successfully."
      );
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.cost) * item.quantity, 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleIncrease = (id) => {
    setCart((current) =>
      current.map((item) =>
        item.item_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          item.item_id === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (id) => {
    setCart((current) => current.filter((item) => item.item_id !== id));
  };

  const ensureAuthenticatedForCheckout = async () => {
    try {
      const res = await axios.get("/auth/verify");
      return res.data?.valid && res.data?.user?.role === "customer";
    } catch {
      return false;
    }
  };

  const handleQuickTimePreset = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setPickupTime(`${hours}:${mins}`);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your tray is empty.");
      return;
    }

    const isAuthenticated = await ensureAuthenticatedForCheckout();
    if (!isAuthenticated) {
      toast("Please log in to finish your preorder.", {
        icon: "🔐",
      });
      navigate("/login", {
        state: {
          redirectTo: "/cart",
          resumeCheckout: true,
        },
      });
      return;
    }

    setLoading(true);
    setPaymentError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout SDK");
      }

      const createOrderRes = await axios.post("/api/payment/create-order", {
        items: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
        canteen_id: 1,
        pickup_time: pickupTime || null,
      });

      const { razorpay } = createOrderRes.data;
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID || razorpay.key;
      let paymentCompleted = false;
      let verificationStarted = false;

      if (!key) {
        throw new Error("Razorpay key is missing in frontend environment");
      }

      const razorpayCheckout = new window.Razorpay({
        key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        order_id: razorpay.order_id,
        prefill: {},
        theme: { color: "#ff5e36" },
        modal: {
          ondismiss: async () => {
            if (paymentCompleted || verificationStarted) {
              return;
            }
            setPaymentError(
              "Checkout was closed before payment confirmation. The order is reserved briefly—you can retry payment."
            );
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            paymentCompleted = true;
            verificationStarted = true;
            await axios.post("/api/payment/verify", response);
            toast.success("Payment successful! Preorder sent to kitchen.");
            setCart([]);
            setPickupTime("");
            clearCart();
            setShowSuccessModal(true);

            setTimeout(() => {
              setShowSuccessModal(false);
              navigate("/orders");
            }, 1800);
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            setPaymentError(
              verifyError.response?.data?.message ||
                "Payment was charged but verification failed. Please check My Orders."
            );
          } finally {
            setLoading(false);
          }
        },
      });

      razorpayCheckout.on("payment.failed", async (response) => {
        if (paymentCompleted || verificationStarted) {
          return;
        }
        paymentCompleted = false;
        try {
          await axios.post("/api/payment/fail", {
            razorpay_order_id: razorpay.order_id,
            reason:
              response.error?.description ||
              response.error?.reason ||
              "Razorpay payment failed",
          });
        } catch (failureRecordError) {
          console.error("Failed to record payment failure:", failureRecordError);
        }
        setPaymentError(response.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });

      razorpayCheckout.open();
    } catch (err) {
      console.error("Order failed:", err);
      setPaymentError(err.response?.data?.message || err.message || "Failed to start payment.");
      toast.error(err.response?.data?.message || err.message || "Failed to start payment.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] subtle-mesh pb-20">
      <Navbar cartCount={cart.length} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb / Step Indicator */}
        <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="text-brand-600">1. Preorder Tray</span>
          <ChevronRight size={14} />
          <span>2. Pickup Slot</span>
          <ChevronRight size={14} />
          <span>3. Digital Token</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">
          {/* Left Column: Cart Items */}
          <section>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                Review Your Preorder Tray
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Verify your dishes, set your pickup time, and send your ticket directly to the kitchen.
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-[2.5rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-subtle">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900">Your food tray is empty</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Browse today's canteen specials, pre-order before your break starts, and avoid the counter rush.
                </p>
                <button
                  onClick={() => navigate("/home")}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-600 active:scale-95"
                >
                  <span>Explore Canteen Menu</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item.item_id}
                    item={item}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                ))}

                {/* Special Instructions Box */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-subtle">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Special Kitchen Notes <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, pack in parcel, extra tissues..."
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    maxLength={100}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Order Summary & Checkout */}
          <aside className="sticky top-24 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-lg font-display font-bold text-slate-900">Preorder Summary</h2>

            {/* Price breakdown */}
            <div className="mt-5 space-y-3 text-sm border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Items</span>
                <span className="font-semibold text-slate-900">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Food Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>Student Platform Fee</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    FREE
                  </span>
                </span>
                <span className="font-semibold text-emerald-600">₹0.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Canteen Packing & Taxes</span>
                <span className="text-xs text-slate-400">Included</span>
              </div>
            </div>

            {/* Preferred Pickup Slot */}
            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Preferred Pickup Time
              </label>

              {/* Quick Preset Chips */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleQuickTimePreset(10)}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  ⚡ In 10 min
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTimePreset(20)}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  ⏰ In 20 min
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTimePreset(30)}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  🍱 In 30 min
                </button>
              </div>

              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Leave blank for immediate kitchen queue preparation.
              </p>
            </div>

            {/* Error banner if any */}
            {paymentError && (
              <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Net Amount Box */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-white shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-orange-300">Total Payable</p>
                  <p className="text-2xl font-display font-extrabold text-white mt-0.5">
                    ₹{subtotal.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                    <ShieldCheck size={12} />
                    <span>Instant Token</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleOrder}
              disabled={loading || cart.length === 0}
              className={`mt-4 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-semibold text-white shadow-glow transition-all ${
                loading || cart.length === 0
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-brand-500 hover:bg-brand-600 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Connecting Razorpay...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>{paymentError ? "Retry Payment" : `Pay ₹${subtotal.toFixed(0)} with Razorpay`}</span>
                </>
              )}
            </button>

            {/* Guarantee Note */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>100% Refundable if cancelled before preparation</span>
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900">Preorder Placed!</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your ticket has been sent to the canteen kitchen. Generating your pickup token now...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-brand-200 border-t-brand-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
