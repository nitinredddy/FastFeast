import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {
  AUTH_COOKIE_BASE_OPTIONS,
  AUTH_COOKIE_MAX_AGE_MS,
  JWT_EXPIRES_IN,
} from "../config/auth.js";
import dotenv from "dotenv";
import {
  getCookieNameForPortal,
  getCookieNameForUserRole,
  getPortalFromRequest,
  getTokenFromRequest,
} from "../utils/authCookies.js";
dotenv.config();

// ✅ helper function to generate token & send cookie
const sendToken = (req, user, res, message) => {
  const token = jwt.sign(
    { user_id: user.user_id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const cookieName = getCookieNameForUserRole(user.role);

  // Send token as HTTP-only cookie
  res.cookie(cookieName, token, { ...AUTH_COOKIE_BASE_OPTIONS, maxAge: AUTH_COOKIE_MAX_AGE_MS });

  // Clear the legacy shared cookie if it exists from older sessions.
  res.clearCookie("token", AUTH_COOKIE_BASE_OPTIONS);

  if (cookieName !== "token") {
    res.clearCookie("token", AUTH_COOKIE_BASE_OPTIONS);
  }

  res.json({
    message,
    user: {
      id: user.user_id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  });
};

// ------------------------------------------------------
// 🧾 REGISTER
// ------------------------------------------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const role = "customer";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // check if user already exists
    const [exists] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert into database
    const [result] = await pool.query(
      "INSERT INTO User (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, phone, role]
    );

    // fetch new user
    const [rows] = await pool.query(
      "SELECT user_id, name, email, role FROM User WHERE user_id = ?",
      [result.insertId]
    );
    const newUser = rows[0];

    // ✅ auto-login after register
    sendToken(req, newUser, res, "Registered and logged in successfully");
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({ message: "Some required user fields are missing in the database setup" });
    }

    if (err.code === "ER_NO_DEFAULT_FOR_FIELD") {
      return res.status(400).json({ message: `Database requires an extra field: ${err.sqlMessage}` });
    }

    res.status(500).json({ message: err.sqlMessage || "Registration failed" });
  }
};

// ------------------------------------------------------
// 🔐 LOGIN
// ------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const portal = getPortalFromRequest(req);

    const [rows] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    if (!rows.length) return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];

    // verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    if (portal === "admin" && !["admin", "staff"].includes(user.role)) {
      return res.status(403).json({ message: "You do not have admin access" });
    }

    if (portal === "customer" && user.role !== "customer") {
      return res.status(403).json({ message: "Please use a customer account in the user app." });
    }

    // ✅ send token via cookie
    sendToken(req, user, res, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ------------------------------------------------------
// 🚪 LOGOUT
// ------------------------------------------------------
// controllers/authController.js

export const logout = (req, res) => {
  try {
    const cookieName = getCookieNameForPortal(getPortalFromRequest(req));

    res.clearCookie(cookieName, AUTH_COOKIE_BASE_OPTIONS);
    res.clearCookie("token", AUTH_COOKIE_BASE_OPTIONS);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};



// ✅ VERIFY LOGIN STATUS (for cookie-based auth)
export const verifyUser = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ valid: false, message: "No token found" });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user details (optional, you can skip this if you trust JWT payload)
    const [rows] = await pool.query("SELECT user_id, name, email, role FROM User WHERE user_id = ?", [decoded.user_id]);
    if (!rows.length) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    const user = rows[0];
    res.json({ valid: true, user });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};
