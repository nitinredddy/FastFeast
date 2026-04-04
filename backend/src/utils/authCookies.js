const ADMIN_COOKIE_NAME = "admin_token";
const CUSTOMER_COOKIE_NAME = "customer_token";

export const getPortalFromRequest = (req) => {
  const portal = req.get("x-portal");
  return portal === "admin" ? "admin" : "customer";
};

export const getCookieNameForPortal = (portal) =>
  portal === "admin" ? ADMIN_COOKIE_NAME : CUSTOMER_COOKIE_NAME;

export const getCookieNameForUserRole = (role) =>
  role === "admin" || role === "staff" ? ADMIN_COOKIE_NAME : CUSTOMER_COOKIE_NAME;

export const getTokenFromRequest = (req) => {
  const portal = req.get("x-portal");

  if (portal === "admin") {
    return req.cookies?.[ADMIN_COOKIE_NAME] || null;
  }

  if (portal === "customer") {
    return req.cookies?.[CUSTOMER_COOKIE_NAME] || null;
  }

  return (
    req.cookies?.[CUSTOMER_COOKIE_NAME] ||
    req.cookies?.[ADMIN_COOKIE_NAME] ||
    req.cookies?.token ||
    null
  );
};
