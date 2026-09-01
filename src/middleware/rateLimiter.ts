import rateLimit from 'express-rate-limit';

// Safe helper to extract client IP relying on Express's proxy-validated req.ip
const getClientIp = (req: any): string => {
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
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

// 5. AI Agent Rate Limiter (10 requests per minute for Pro users)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return req.dbUser?.id ? `user_${req.dbUser.id}` : getClientIp(req);
  },
  validate: false,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMITED',
      message: 'AI request rate limit reached (10 requests/minute). Please pause for a moment before your next prompt.',
    },
  },
});


