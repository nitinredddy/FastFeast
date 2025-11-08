import express from "express";
import { register, login, logout, verifyUser } from "../controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verifyUser);

export default router;
