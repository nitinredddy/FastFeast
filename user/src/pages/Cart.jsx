import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import axios from "../api/axios";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("fastfeast-cart")) || []
  );
  const [pickupTime, setPickupTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("fastfeast-cart", JSON.stringify(cart));
  }, [cart]);

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

  const handleConfirmUPI = async () => {
    setShowUPIModal(false);
    setLoading(true);

    try {
      await axios.post("/orders", {
        items: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
        payment_mode: "UPI",
        pickup_time: pickupTime || null,
      });

      toast.success("Order placed successfully");
      setCart([]);
      setPickupTime("");
      localStorage.removeItem("fastfeast-cart");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/orders");
      }, 1800);
    } catch (err) {
      console.error("Order failed:", err);
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setShowUPIModal(true);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_40%,_#f8fafc_100%)]">
      <Navbar cartCount={cart.length} />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
              Checkout
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Review your preorder</h2>
            <p className="mt-2 text-sm text-slate-500">
              Confirm your meal, pick an optional pickup time, and send it to the kitchen.
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Your cart is empty</h3>
              <p className="mt-2 text-sm text-slate-500">
                Add a few dishes from the menu and come back here to place your order.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Browse menu
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
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Order summary</h3>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total items</span>
              <span className="font-semibold text-slate-900">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4 text-xs leading-6 text-orange-900">
              Live stock checks happen at checkout, so you’ll get a clear message if an item sells
              out before you confirm.
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Preferred pickup time
            </span>
            <input
              type="time"
              value={pickupTime}
              onChange={(event) => setPickupTime(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Pay at checkout</p>
            <p className="mt-2 text-3xl font-bold">₹{subtotal.toFixed(2)}</p>
            <p className="mt-2 text-sm text-slate-300">Fast UPI flow with order tracking after payment.</p>
          </div>

          <button
            onClick={handleOrder}
            disabled={loading || cart.length === 0}
            className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              loading || cart.length === 0
                ? "cursor-not-allowed bg-slate-300 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {loading ? "Placing order..." : "Confirm preorder"}
          </button>
        </aside>
      </div>

      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900">UPI payment</h3>
            <p className="mt-2 text-sm text-slate-500">
              Scan the QR below to simulate payment and confirm your preorder.
            </p>

            <div className="mt-6 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=fastfeast@upi&am=${subtotal.toFixed(2)}&cu=INR&size=180x180`}
                alt="UPI QR"
                className="rounded-2xl border border-slate-200 p-3 shadow-sm"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setShowUPIModal(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUPI}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Payment successful
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-green-600">Order placed</h3>
            <p className="mt-3 text-sm text-slate-600">
              Your preorder is in the queue. Redirecting to your order tracker now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
