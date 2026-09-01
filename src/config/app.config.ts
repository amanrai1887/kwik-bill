import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 3000,
  
  // SuperAdmin configuration: Supports comma-separated list of admin emails (no hardcoded fallback)
  superAdminEmails: (process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),

  // Razorpay
  razorpay: {
    keyId: (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
  },

  // Meta WhatsApp Cloud API
  whatsapp: {
    token: (process.env.META_WHATSAPP_TOKEN || '').trim(),
    phoneNumberId: (process.env.META_PHONE_NUMBER_ID || '').trim(),
    defaultTemplate: (process.env.META_WHATSAPP_TEMPLATE || 'payment_reminder').trim(),
  },

  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'invoice-saas-app-fc503',
  },

  // Redis Cache (Temporarily disabled)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
  },

  // Gemini AI Agent
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  },

  // AI Rate Limits & Gating
  ai: {
    maxRequestsPerMinute: Number(process.env.AI_RATE_LIMIT_PER_MIN) || 10,
  },

  // Security / Demo Mode: Strictly disabled in production unless explicitly enabled for dev/testing
  allowDemoAuth: process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_AUTH === 'true',
};

// Authoritative server-side plan pricing (in paise: 1 INR = 100 paise)
export const PLAN_PRICING: Record<string, number> = {
  starter_299: 29900,
  pro_499: 49900,
};

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email || config.superAdminEmails.length === 0) return false;
  return config.superAdminEmails.includes(email.trim().toLowerCase());
}

