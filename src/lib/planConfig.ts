import { SubscriptionPlan, UserProfile } from './types.ts';

export interface PlanLimits {
  name: string;
  badge: string;
  badgeColor: string;
  price: string;
  // Features & limits
  maxInvoicesPerMonth: number; // Infinity for unlimited
  maxClients: number;
  canUseRecurringBilling: boolean;
  canUseWhatsAppDirectApi: boolean; // Direct background API gateway vs manual wa.me
  canExportGstr1Reports: boolean;
  canUseTransportModule: boolean; // LR, Vehicle No, POD
  canUseEscalationTemplates: boolean; // Urgent / Overdue legal escalation templates
  canUseCustomTemplates: boolean; // Custom brand colors & logo
  canUseAllTemplates: boolean; // All 6 designer templates on Pro (vs 2 for Free/Starter)
  allowedTemplatesCount: number;
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanLimits> = {
  trial_15_days: {
    name: '15-Day Free Trial',
    badge: '15-Day Trial',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    price: '₹0',
    maxInvoicesPerMonth: 25,
    maxClients: 10,
    canUseRecurringBilling: false,
    canUseWhatsAppDirectApi: false,
    canExportGstr1Reports: false,
    canUseTransportModule: true,
    canUseEscalationTemplates: false,
    canUseCustomTemplates: false,
    canUseAllTemplates: false,
    allowedTemplatesCount: 2,
  },
  starter_299: {
    name: 'Starter Plan (₹299/mo)',
    badge: 'Starter',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    price: '₹299/mo',
    maxInvoicesPerMonth: Infinity,
    maxClients: Infinity,
    canUseRecurringBilling: false,
    canUseWhatsAppDirectApi: false,
    canExportGstr1Reports: false,
    canUseTransportModule: true,
    canUseEscalationTemplates: false,
    canUseCustomTemplates: false,
    canUseAllTemplates: false,
    allowedTemplatesCount: 2,
  },
  pro_499: {
    name: 'Pro Growth Plan (₹499/mo)',
    badge: 'Pro Growth',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    price: '₹499/mo',
    maxInvoicesPerMonth: Infinity,
    maxClients: Infinity,
    canUseRecurringBilling: true,
    canUseWhatsAppDirectApi: true,
    canExportGstr1Reports: true,
    canUseTransportModule: true,
    canUseEscalationTemplates: true,
    canUseCustomTemplates: true,
    canUseAllTemplates: true,
    allowedTemplatesCount: 6,
  },
};

export function isSuperAdminUser(userOrProfile?: { role?: string; email?: string | null } | null): boolean {
  if (!userOrProfile) return false;
  if (userOrProfile.role === 'superadmin') return true;
  const email = userOrProfile.email?.toLowerCase();
  return email === 'arai.343531@gmail.com';
}

export function getPlanLimits(profile: UserProfile | null): PlanLimits {
  if (!profile) return PLAN_CONFIG.trial_15_days;
  if (isSuperAdminUser(profile)) {
    return PLAN_CONFIG.pro_499;
  }
  const plan = profile.subscriptionPlan || 'trial_15_days';
  return PLAN_CONFIG[plan] || PLAN_CONFIG.trial_15_days;
}

export function isPlanExpired(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (isSuperAdminUser(profile)) {
    return false;
  }
  if (profile.subscriptionStatus === 'expired' || profile.subscriptionStatus === 'inactive') {
    return true;
  }
  if (profile.subscriptionPlan === 'trial_15_days' && profile.trialEndsAt) {
    const expiry = new Date(profile.trialEndsAt).getTime();
    return Date.now() > expiry;
  }
  return false;
}
