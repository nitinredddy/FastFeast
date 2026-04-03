import express from "express";
import { getInventory, updateInventory } from "../controllers/inventoryController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateJWT, authorizeRoles("admin","staff"), getInventory);
router.patch("/:id", authenticateJWT, authorizeRoles("admin","staff"), updateInventory);

export default router;
