import express from "express";
import { getInventory } from "../controllers/inventoryController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateJWT, authorizeRoles("admin","staff"), getInventory);

export default router;
