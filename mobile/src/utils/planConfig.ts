import { SubscriptionPlan, UserProfile } from '../types/index.ts';

export interface PlanLimits {
  name: string;
  badge: string;
  price: string;
  canUseRecurringBilling: boolean;
  canUseWhatsAppDirectApi: boolean;
  canExportGstr1Reports: boolean;
  canUseEscalationTemplates: boolean;
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanLimits> = {
  trial_15_days: {
    name: '15-Day Free Trial',
    badge: '15-Day Trial',
    price: '₹0',
    canUseRecurringBilling: false,
    canUseWhatsAppDirectApi: false,
    canExportGstr1Reports: false,
    canUseEscalationTemplates: false,
  },
  starter_299: {
    name: 'Starter Plan (₹299/mo)',
    badge: 'Starter',
    price: '₹299/mo',
    canUseRecurringBilling: false,
    canUseWhatsAppDirectApi: false,
    canExportGstr1Reports: false,
    canUseEscalationTemplates: false,
  },
  pro_499: {
    name: 'Pro Growth Plan (₹499/mo)',
    badge: 'Pro Growth',
    price: '₹499/mo',
    canUseRecurringBilling: true,
    canUseWhatsAppDirectApi: true,
    canExportGstr1Reports: true,
    canUseEscalationTemplates: true,
  },
};

export function getPlanLimits(profile: UserProfile | null): PlanLimits {
  if (!profile) return PLAN_CONFIG.trial_15_days;
  if (profile.role === 'superadmin' || profile.email?.toLowerCase() === 'arai.343531@gmail.com') {
    return PLAN_CONFIG.pro_499;
  }
  const plan = profile.subscriptionPlan || 'trial_15_days';
  return PLAN_CONFIG[plan] || PLAN_CONFIG.trial_15_days;
}
