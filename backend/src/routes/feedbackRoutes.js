import express from "express";
import {
  getAllFeedback,
  addFeedback,
  getFeedbackSummary
} from "../controllers/feedbackController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer submits feedback
router.post("/", authenticateJWT, addFeedback);

// Admin/staff view all feedback
router.get("/", authenticateJWT, authorizeRoles("admin", "staff"), getAllFeedback);
router.get("/summary", authenticateJWT, authorizeRoles("admin", "staff"), getFeedbackSummary);

export default router;
