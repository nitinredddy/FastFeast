import express from "express";
import {
  getAllFeedback,
  addFeedback
} from "../controllers/feedbackController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer submits feedback
router.post("/", authenticateJWT, authorizeRoles("customer"), addFeedback);

// Admin/staff view all feedback
router.get("/", authenticateJWT, authorizeRoles("admin", "staff"), getAllFeedback);

export default router;
