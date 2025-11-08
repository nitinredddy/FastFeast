import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

// ✅ helper function to generate token & send cookie
const sendToken = (user, res, message) => {
  const token = jwt.sign(
    { user_id: user.user_id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Send token as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,       // prevents JS access (XSS protection)
    secure: process.env.NODE_ENV === "production",        // true in production with HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

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
    const { name, email, password, phone, role = "customer"} = req.body;

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
    const [rows] = await pool.query("SELECT * FROM User WHERE user_id = ?", [result.insertId]);
    const newUser = rows[0];

    // ✅ auto-login after register
    sendToken(newUser, res, "Registered and logged in successfully");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ------------------------------------------------------
// 🔐 LOGIN
// ------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    if (!rows.length) return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];

    // verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    // ✅ send token via cookie
    sendToken(user, res, "Login successful");
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};



// ✅ VERIFY LOGIN STATUS (for cookie-based auth)
export const verifyUser = async (req, res) => {
  try {
    const token = req.cookies.token; // read from cookie
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

