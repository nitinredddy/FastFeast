import express from "express";
import {
  createPaymentOrder,
  handlePaymentWebhook,
  markPaymentFailure,
  refundPayment,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  validateCreatePaymentOrder,
  validatePaymentFailure,
  validateVerifyPayment,
} from "../middlewares/paymentValidation.js";
import { createRateLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();
const paymentRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 25, keyPrefix: "payment" });

router.post("/webhook", handlePaymentWebhook);

router.post(
  "/create-order",
  authenticateJWT,
  authorizeRoles("customer"),
  paymentRateLimiter,
  validateCreatePaymentOrder,
  createPaymentOrder
);

router.post(
  "/verify",
  authenticateJWT,
  authorizeRoles("customer"),
  paymentRateLimiter,
  validateVerifyPayment,
  verifyPayment
);

router.post(
  "/fail",
  authenticateJWT,
  authorizeRoles("customer"),
  paymentRateLimiter,
  validatePaymentFailure,
  markPaymentFailure
);

router.post(
  "/refund/:orderId",
  authenticateJWT,
  authorizeRoles("admin", "staff"),
  paymentRateLimiter,
  refundPayment
);

export default router;
