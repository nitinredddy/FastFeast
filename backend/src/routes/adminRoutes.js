// routes/adminRoutes.js
import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";
import settingsRoutes from "./settingsRoutes.js";

const router = express.Router();

router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles("admin", "staff"),
  getDashboardStats
);

router.use("/settings", settingsRoutes);

export default router;
