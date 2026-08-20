import React from 'react';
import { 
  Clock, 
  Sparkles, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  LogOut, 
  Building, 
  Mail,
  Zap,
  Building2
} from 'lucide-react';
import { UserProfile } from '../lib/types.ts';
import { useAuth } from '../lib/AuthContext.tsx';

interface TrialExpiredViewProps {
  profile: UserProfile | null;
  onOpenPlanRequest: (plan: 'starter_299' | 'pro_499') => void;
  onViewLanding: () => void;
}

export const TrialExpiredView: React.FC<TrialExpiredViewProps> = ({
  profile,
  onOpenPlanRequest,
  onViewLanding,
}) => {
  const { user, logout } = useAuth();

  const handleWhatsAppAdmin = () => {
    const text = encodeURIComponent(
      `Hello Kwik-Bill Admin, my 15-day free trial for "${profile?.businessName || user?.email}" has expired. I want to subscribe to a paid plan. Please help me activate my workspace.`
    );
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-white selection:bg-indigo-500 selection:text-white">
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3 mb-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-wider">
            15-Day Free Trial Ended
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your Free Trial Has Expired
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Your 15-day exploratory period has concluded. To continue creating GST invoices, sending automated WhatsApp reminders, and managing clients, choose a subscription plan below.
          </p>
        </div>

        {/* User / Business summary */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">{profile?.businessName || 'My Business'}</div>
              <div className="text-[11px] text-slate-400 font-mono">{user?.email || profile?.email}</div>
            </div>
          </div>

          <div className="sm:text-right text-[11px] text-slate-400">
            <div>All your invoices & clients data are <span className="text-emerald-400 font-bold">safe & preserved</span>.</div>
          </div>
        </div>

        {/* Subscription Plan Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Starter Plan */}
          <div className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-slate-400">Starter Plan</span>
                <span className="text-lg font-black text-white font-mono">₹299 <span className="text-xs font-normal text-slate-400">/mo</span></span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Ideal for solo merchants, small transport fleets & coaching centers.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300 mb-5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited Invoices + UPI QR</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>WhatsApp Payment Reminders</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPlanRequest('starter_299')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Subscribe Starter (₹299)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pro Growth Plan */}
          <div className="bg-indigo-950/40 border-2 border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg shadow-indigo-500/10">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
              Recommended
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-indigo-300">Pro Growth Plan</span>
                <span className="text-lg font-black text-white font-mono">₹499 <span className="text-xs font-normal text-slate-400">/mo</span></span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Full automation suite with Auto-Billing recurring engine & 6 custom templates.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300 mb-5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Everything in Starter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Automated Recurring Invoices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>6 Designer Invoice Templates</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPlanRequest('pro_499')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Subscribe Pro Growth (₹499)</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={handleWhatsAppAdmin}
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Need Help? Chat on WhatsApp</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewLanding}
              className="text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
            >
              Landing Page
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => logout()}
              className="text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
