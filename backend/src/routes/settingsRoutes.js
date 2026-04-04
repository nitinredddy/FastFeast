import express from "express";
import { fetchBusinessSettings, updateBusinessSettings } from "../controllers/settingsController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateJWT, authorizeRoles("admin", "staff"), fetchBusinessSettings);
router.patch("/", authenticateJWT, authorizeRoles("admin"), updateBusinessSettings);

export default router;
