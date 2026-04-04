import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
};

const parseInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

export const AUTH_COOKIE_MAX_AGE_MS = parseInteger(
  process.env.AUTH_COOKIE_MAX_AGE_MS,
  7 * 24 * 60 * 60 * 1000
);

export const AUTH_COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined;
export const AUTH_COOKIE_SAME_SITE = process.env.AUTH_COOKIE_SAME_SITE || "lax";
export const AUTH_COOKIE_SECURE = parseBoolean(
  process.env.AUTH_COOKIE_SECURE,
  process.env.NODE_ENV === "production"
);
export const AUTH_TRUST_PROXY = parseBoolean(process.env.AUTH_TRUST_PROXY, false);
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const AUTH_COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: AUTH_COOKIE_SECURE,
  sameSite: AUTH_COOKIE_SAME_SITE,
  domain: AUTH_COOKIE_DOMAIN,
  path: "/",
};

export const ALLOWED_CORS_ORIGINS = [
  process.env.CORS_ORIGIN_CUSTOMER,
  process.env.CORS_ORIGIN_ADMIN,
].filter(Boolean);
