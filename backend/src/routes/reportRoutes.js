import express from "express";
import { userTotalSpent, orderDiscount } from "../controllers/reportController.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/user/:id/total", authenticateJWT, authorizeRoles("admin","staff"), userTotalSpent);
router.get("/order/:id/discount", authenticateJWT, orderDiscount);

export default router;
