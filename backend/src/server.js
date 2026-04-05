import dotenv from "dotenv";
import { app, bootstrapApp } from "./app.js";

dotenv.config();

// ✅ Start server
const PORT = process.env.PORT || 5000;
bootstrapApp()
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
