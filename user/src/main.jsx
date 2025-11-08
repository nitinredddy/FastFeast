import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";

// ✅ Global Axios Config
axios.defaults.baseURL = "http://localhost:3000"; // your backend
axios.defaults.withCredentials = true; // allows cookies (JWT)

// ✅ Render App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
