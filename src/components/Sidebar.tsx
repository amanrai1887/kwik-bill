import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Plus, 
  ExternalLink,
  LogOut,
  Sparkles,
  ShieldCheck,
  Repeat,
  Sun,
  Moon,
  Keyboard
} from 'lucide-react';
import { UserProfile } from '../lib/types.ts';
import { useAuth } from '../lib/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

export type AppTab = 'dashboard' | 'invoices' | 'recurring' | 'clients' | 'reminders' | 'reports' | 'settings' | 'admin';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onCreateInvoice: () => void;
  onViewLanding: () => void;
  onOpenShortcuts?: () => void;
  profile: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onCreateInvoice,
  onViewLanding,
  onOpenShortcuts,
  profile,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isSuperAdmin = 
    profile?.role === 'superadmin' || 
    user?.email?.toLowerCase() === 'arai.343531@gmail.com' ||
    profile?.email?.toLowerCase() === 'arai.343531@gmail.com';

  const isPro = profile?.subscriptionPlan === 'pro_499' || isSuperAdmin;

  const navItems = isSuperAdmin
    ? [{ id: 'admin', label: 'Company & Subscription Directory', icon: ShieldCheck, highlight: true }]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'invoices', label: 'Invoices & Dues', icon: FileText },
        { id: 'recurring', label: 'Recurring Auto-Billing', icon: Repeat, proOnly: !isPro },
        { id: 'clients', label: 'Client Directory', icon: Users },
        { id: 'reminders', label: 'WhatsApp Logs', icon: MessageSquare },
        { id: 'reports', label: 'Monthly Reports', icon: BarChart3 },
        { id: 'settings', label: 'Settings & Plan', icon: Settings },
      ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 no-print select-none transition-colors duration-200">
      {/* Brand & Action */}
      <div className="p-4 space-y-4">
        {/* Brand & Theme Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange(isSuperAdmin ? 'admin' : 'dashboard')}>
            <img 
              src="/logo.png" 
              alt="KwikBill Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Kwik<span className="text-indigo-600 dark:text-indigo-400">Bill</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-800 uppercase">
                  {isSuperAdmin ? 'Admin' : 'Pro'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {isSuperAdmin ? 'Master Owner Portal' : 'SMB Invoicing & WhatsApp'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Keyboard Shortcuts Trigger */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts (?)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick New Invoice Button (Only for client companies, not superadmin) */}
        {!isSuperAdmin && (
          <button
            onClick={onCreateInvoice}
            id="sidebar-create-invoice-btn"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
            <kbd className="hidden sm:inline-block ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-700/80 text-indigo-100">
              N
            </kbd>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as AppTab)}
                id={`sidebar-tab-${item.id}`}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/80 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.proOnly && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded uppercase tracking-wider shadow-2xs">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: User & Landing switch */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Switch back to Landing page */}
        <button
          onClick={onViewLanding}
          id="sidebar-view-landing-btn"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <span>View Public Landing Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {isSuperAdmin ? 'SA' : (profile?.businessName ? profile.businessName.charAt(0).toUpperCase() : 'K')}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {isSuperAdmin ? 'SaaS SuperAdmin' : (profile?.businessName || 'My Business')}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isSuperAdmin ? 'Platform Owner' : (profile?.subscriptionPlan === 'pro_499' ? '₹499 Pro Plan' : '₹299 Starter')}
              </div>
            </div>
          </div>

          {user && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};


