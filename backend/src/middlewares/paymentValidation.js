const isValidItemsPayload = (items) =>
  Array.isArray(items) &&
  items.length > 0 &&
  items.every(
    (item) =>
      Number.isInteger(item.item_id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );

export const validateCreatePaymentOrder = (req, res, next) => {
  const { items, canteen_id = 1, pickup_time = null } = req.body;

  if (!isValidItemsPayload(items)) {
    return res.status(400).json({ message: "Items must be a non-empty array of valid quantities" });
  }

  if (!Number.isInteger(Number(canteen_id)) || Number(canteen_id) <= 0) {
    return res.status(400).json({ message: "Invalid canteen id" });
  }

  if (pickup_time !== null && typeof pickup_time !== "string") {
    return res.status(400).json({ message: "Pickup time must be a valid time string or null" });
  }

  next();
};

export const validateVerifyPayment = (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing Razorpay verification fields" });
  }

  next();
};

export const validatePaymentFailure = (req, res, next) => {
  const { razorpay_order_id, reason } = req.body;

  if (!razorpay_order_id) {
    return res.status(400).json({ message: "razorpay_order_id is required" });
  }

  if (reason && typeof reason !== "string") {
    return res.status(400).json({ message: "Failure reason must be a string" });
  }

  next();
};
