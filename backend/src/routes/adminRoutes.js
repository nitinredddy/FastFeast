// routes/adminRoutes.js
import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles("admin"),
  getDashboardStats
);

export default router;
