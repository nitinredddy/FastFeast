import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("fastfeast-cart")) || []
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    calculateTotal();
    localStorage.setItem("fastfeast-cart", JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = () => {
    const t = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    setTotal(t);
  };

  const handleIncrease = (id) => {
    setCart(
      cart.map((item) =>
        item.item_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCart(
      cart
        .map((item) =>
          item.item_id === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (id) => {
    setCart(cart.filter((item) => item.item_id !== id));
  };

  const handleConfirmUPI = async () => {
    setShowUPIModal(false);
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
        amount: total,
        payment_mode: "UPI",
      };

      console.log("🟠 Sending orderData:", orderData);


      const res = await axios.post("/orders", orderData);

      console.log("🟢 Response from backend:", res.data);


      // ✅ Step 1: Show success toast
      toast.success("🎉 Order placed successfully via UPI!");

      // ✅ Step 2: Clear cart
      setCart([]);
      localStorage.removeItem("fastfeast-cart");

      // ✅ Step 3: Show success modal
      setShowSuccessModal(true);

      // ✅ Step 4: Redirect to /orders after short delay
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/orders");
      }, 2000);
    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setShowUPIModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cart.length} />

      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">🛒 Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-lg">
            Your cart is empty. Go grab something delicious 😋
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 flex flex-col gap-4">
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

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-md h-fit border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Order Summary
              </h3>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-700">
                <span>GST (5%):</span>
                <span>₹{(total * 0.05).toFixed(2)}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span>₹{(total * 1.05).toFixed(2)}</span>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading}
                className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {loading ? "Placing Order..." : "Confirm Preorder (UPI)"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ UPI Payment Simulation Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">💳 UPI Payment</h3>
            <p className="text-gray-500 mb-4">
              Please scan the QR below to complete your payment.
            </p>

            <div className="flex justify-center mb-4">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=fastfeast@upi&amount=1&currency=INR&size=150x150"
                alt="UPI QR"
                className="rounded-lg shadow-md"
              />
            </div>

            <p className="text-gray-600 text-sm mb-6">
              (Simulated — no real payment required)
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowUPIModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUPI}
                className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              >
                Payment Successful ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Order Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-[90%] max-w-md">
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              🎉 Order Placed!
            </h3>
            <p className="text-gray-600 mb-4">
              Your preorder has been successfully placed via UPI.
            </p>
            <p className="text-gray-700 font-medium">
              Redirecting you to <span className="text-orange-500">My Orders</span>...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
