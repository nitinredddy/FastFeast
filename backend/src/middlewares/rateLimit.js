const stores = new Map();

const cleanupStore = (bucket, now, windowMs) => {
  while (bucket.length && now - bucket[0] > windowMs) {
    bucket.shift();
  }
};

export const createRateLimiter = ({ windowMs, max, keyPrefix }) => {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const bucket = stores.get(key) || [];

    cleanupStore(bucket, now, windowMs);

    if (bucket.length >= max) {
      return res.status(429).json({
        message: "Too many requests. Please wait a bit before trying again.",
      });
    }

    bucket.push(now);
    stores.set(key, bucket);
    next();
  };
};
