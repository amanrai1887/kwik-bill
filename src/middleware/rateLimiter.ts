import rateLimit from 'express-rate-limit';

// Safe helper to extract client IP across local, Docker, and serverless/Vercel environments
const getClientIp = (req: any): string => {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || '127.0.0.1';
};

// 1. General API Rate Limiter (300 requests per minute)
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down and try again in a minute.',
  },
});

// 2. Public Pay Link Limiter (Anti-DDoS & Brute Force: 60 requests per minute)
export const publicPayLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: 'Too many invoice lookup requests from this IP. Please try again later.',
  },
});

// 3. Outbound WhatsApp Reminder Limiter (Anti-Spam: 30 reminder sends per minute)
export const remindersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: 'WhatsApp dispatch rate limit reached. Please wait a moment before sending more reminders.',
  },
});

// 4. Order & Checkout Limiter (Anti-Fraud: 25 order creations per minute)
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: 'Too many payment requests initiated. Please retry shortly.',
  },
});

