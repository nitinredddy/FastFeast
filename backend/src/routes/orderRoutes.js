import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../controllers/orderController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🧾 Create a new order (user checkout)
router.post("/", authenticateJWT, createOrder);

// 📦 Get all orders for the logged-in user
router.get("/user", authenticateJWT, getUserOrders);

// 📦 Get a single order by ID (optional)
router.get("/:id", authenticateJWT, getOrderById);

export default router;
