import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 3000,
  
  // SuperAdmin configuration: Supports comma-separated list of admin emails
  superAdminEmails: (process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || 'arai.343531@gmail.com')
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

  // Security / Demo Mode
  allowDemoAuth: process.env.ALLOW_DEMO_AUTH !== 'false',
};

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return config.superAdminEmails.includes(email.trim().toLowerCase());
}
