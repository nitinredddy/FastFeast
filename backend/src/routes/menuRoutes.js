// routes/menuRoutes.js
import express from "express";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "../controllers/menuController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔸 Public - anyone can view available menu
router.get("/", getMenu);

// 🔸 Admin only - manage menu
router.post("/", authenticateJWT, authorizeRoles("admin"), addMenuItem);
router.put("/:id", authenticateJWT, authorizeRoles("admin"), updateMenuItem);
router.delete("/:id", authenticateJWT, authorizeRoles("admin"), deleteMenuItem);

// 🔸 Admin/staff - toggle availability on/off
router.patch("/:id/availability", authenticateJWT, authorizeRoles("admin", "staff"), toggleAvailability);

export default router;
