// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ALLOWED_CORS_ORIGINS, AUTH_TRUST_PROXY } from "./config/auth.js";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import pool from "./config/db.js";
import { ensureOrderPaymentSchema } from "./lib/orderSchema.js";
import { ensurePaymentSchema } from "./lib/paymentSchema.js";

dotenv.config();
const app = express();

if (AUTH_TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

// Base routes
app.use("/auth", authRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes); // ✅ for dashboard stats
app.use("/admin-routes", adminOrderRoutes);

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

  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
ensureOrderPaymentSchema()
  .then(() => ensurePaymentSchema())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 FastFeast backend running on port ${PORT}`);
      console.log(`🧑‍💻 Customer UI: ${process.env.CORS_ORIGIN_CUSTOMER}`);
      console.log(`👨‍🍳 Admin UI: ${process.env.CORS_ORIGIN_ADMIN}`);
    });
  })
  .catch((err) => {
    console.error("Failed to ensure order payment schema:", err);
    process.exit(1);
  });
