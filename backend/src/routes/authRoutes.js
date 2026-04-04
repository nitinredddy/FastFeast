import express from "express";
import { register, login, logout, verifyUser } from "../controllers/authController.js";
import { createRateLimiter } from "../middlewares/rateLimit.js";
const router = express.Router();
const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: "auth" });

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.get("/verify", verifyUser);

export default router;
