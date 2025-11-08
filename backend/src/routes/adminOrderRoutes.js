import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderById
} from "../controllers/orderController.js";
import { authenticateJWT, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 👀 View all user orders (admin dashboard)
router.get("/", authenticateJWT, authorizeAdmin, getAllOrders);

// 👁️ View details of a specific order (for modal)
router.get("/:id", authenticateJWT, authorizeAdmin, getOrderById);

// 🔄 Update status of a specific order
router.patch("/:id", authenticateJWT, authorizeAdmin, updateOrderStatus);

export default router;
