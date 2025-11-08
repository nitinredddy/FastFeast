// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js"

dotenv.config();
const app = express();
app.use(cookieParser())
app.use(cors({
    origin:[process.env.CORS_ORIGIN_CUSTOMER,process.env.CORS_ORIGIN_ADMIN],
    credentials:true
}));
app.use(express.json());

// Base routes
app.use("/auth", authRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes); // ✅ for dashboard stats
app.use("/admin-routes", adminOrderRoutes)

// ✅ Root health check
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.status(200).json({ message: "FastFeast API running ✅", db: "Connected", rows });
  } catch (err) {
    res.status(500).json({ message: "FastFeast API running ❌", db: "Not connected" });
  }
});

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FastFeast backend running on port ${PORT}`);
  console.log(`🧑‍💻 Customer UI: ${process.env.CORS_ORIGIN_CUSTOMER}`);
  console.log(`👨‍🍳 Admin UI: ${process.env.CORS_ORIGIN_ADMIN}`);
});
