import React from 'react';
import { 
  Menu, 
  MessageSquare, 
  Plus, 
  Bell, 
  LogIn, 
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';
import { isSuperAdminUser } from '../lib/planConfig.ts';

import { UserProfile } from '../lib/types.ts';
import { AppTab } from './Sidebar.tsx';

interface AppHeaderProps {
  activeTab: AppTab;
  profile: UserProfile | null;
  onOpenMobileMenu: () => void;
  onCreateInvoice: () => void;
  onViewLanding: () => void;
  onOpenLogin: () => void;
  onOpenPlanModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  profile,
  onOpenMobileMenu,
  onCreateInvoice,
  onViewLanding,
  onOpenLogin,
  onOpenPlanModal,
}) => {
  const { user, logout } = useAuth();

  const isSuperAdmin = isSuperAdminUser(profile) || isSuperAdminUser(user);

  let remainingTrialDays = 15;
  if (profile?.trialEndsAt) {
    const diffTime = new Date(profile.trialEndsAt).getTime() - Date.now();
    remainingTrialDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const tabTitles: Record<AppTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time billing & collection tracking' },
    invoices: { title: 'Invoices & Billing', subtitle: 'Manage invoices, trigger WhatsApp reminders & settle dues' },
    recurring: { title: 'Recurring Invoices & Auto-Billing', subtitle: 'Automated contract subscriptions, retainer schedules & cron generation' },
    clients: { title: 'Client Directory', subtitle: 'Directory of customers, parties & GST credit profiles' },
    reminders: { title: 'WhatsApp Audit Logs', subtitle: 'Sent payment reminders & response tracker' },
    reports: { title: 'Monthly Reports & CA Sheets', subtitle: 'Monthly collection efficiency, GST liabilities & TDS' },
    settings: { title: 'Business Profile & Plan', subtitle: 'UPI ID for QR codes, GSTIN & ₹299/₹499 subscription settings' },
    admin: { title: 'Super Admin Control Center', subtitle: 'Owner portal to manage all SaaS business subscriptions & MRR' },
  };

  const current = tabTitles[activeTab] || { title: 'Workspace', subtitle: '' };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 no-print transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
            {current.title}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* UPI VPA indicator (Only for tenant companies) */}
        {!isSuperAdmin && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>UPI: {profile?.upiId || 'speedytrans@okaxis'}</span>
          </div>
        )}

        {/* Current Plan Status Badge & Trial Remaining Days */}
        {!isSuperAdmin && profile && (
          <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
            profile.subscriptionPlan === 'pro_499'
              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : profile.subscriptionPlan === 'starter_299'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            <span>
              {profile.subscriptionPlan === 'pro_499'
                ? 'Pro Growth (₹499)'
                : profile.subscriptionPlan === 'starter_299'
                ? 'Starter (₹299)'
                : `15-Day Trial (${remainingTrialDays}d left)`}
            </span>
            {(profile.subscriptionStatus === 'trial' || profile.subscriptionPlan === 'trial_15_days') && onOpenPlanModal && (
              <button
                type="button"
                onClick={onOpenPlanModal}
                className="ml-1 px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:bg-amber-300 dark:hover:bg-amber-800 text-[10px] uppercase font-black cursor-pointer transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* Auth / Profile status */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {user.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};



