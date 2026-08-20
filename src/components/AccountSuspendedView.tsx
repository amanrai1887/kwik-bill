import React from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  LogOut, 
  MessageSquare, 
  Building, 
  Mail, 
  ArrowLeft,
  RefreshCw,
  Send
} from 'lucide-react';
import { UserProfile } from '../lib/types.ts';
import { useAuth } from '../lib/AuthContext.tsx';

interface AccountSuspendedViewProps {
  profile: UserProfile | null;
  onOpenPlanRequest: () => void;
  onViewLanding: () => void;
}

export const AccountSuspendedView: React.FC<AccountSuspendedViewProps> = ({
  profile,
  onOpenPlanRequest,
  onViewLanding,
}) => {
  const { user, logout } = useAuth();

  const handleWhatsAppAdmin = () => {
    const text = encodeURIComponent(
      `Hello Kwik-Bill Admin, my business account "${profile?.businessName || user?.email}" (Email: ${user?.email || profile?.email}) has been suspended. Please help me reactivate my subscription.`
    );
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 text-white selection:bg-rose-500 selection:text-white">
      <div className="max-w-xl w-full bg-slate-800/90 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center space-y-3 mb-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 uppercase tracking-wider">
            Account Suspended
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Access Restricted
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Your business account has been suspended by the platform administrator. Access to invoices, recurring billing, and client directories is currently paused.
          </p>
        </div>

        {/* Tenant Info Card */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/60 mb-6 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Company:</span>
            </span>
            <span className="font-bold text-white">{profile?.businessName || 'Unnamed Business'}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email:</span>
            </span>
            <span className="font-mono text-slate-300">{user?.email || profile?.email}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Status:</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase text-[10px]">
              Suspended
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onOpenPlanRequest}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Reactivation / Plan Request</span>
          </button>

          <button
            onClick={handleWhatsAppAdmin}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Support on WhatsApp</span>
          </button>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onViewLanding}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500 mt-6">
          If you believe this suspension is an error, please reach out to admin for immediate resolution.
        </p>
      </div>
    </div>
  );
};
