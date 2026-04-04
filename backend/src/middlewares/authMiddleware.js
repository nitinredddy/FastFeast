// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const getPreferredCookieName = (req) => {
  const client = String(req.headers["x-app-client"] || "").toLowerCase();
  return client === "admin" ? "admin_token" : "customer_token";
};

export const authenticateJWT = (req, res, next) => {
  const preferredCookieName = getPreferredCookieName(req);
  const token =
    req.cookies?.[preferredCookieName] ||
    req.cookies?.customer_token ||
    req.cookies?.admin_token ||
    req.cookies?.token;
  if (!token)
    return res.status(401).json({ message: "No token found in cookies" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
