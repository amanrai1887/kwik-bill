import React from 'react';
import { Smartphone, CheckCircle, Zap, BellRing, QrCode, ShieldCheck, Download } from 'lucide-react';

export const MobileAppSection: React.FC = () => {
  return (
    <section id="mobile-app" className="py-20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>KwikBill Mobile Edition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Manage Billing & WhatsApp Reminders <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Directly from Your Phone</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Never wait until you get back to the office. Generate GST invoices on-the-go, dispatch 1-tap WhatsApp payment reminders with UPI links, and verify real-time settlements from anywhere.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Instant Mobile Invoicing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create GST invoices with HSN codes, vehicle/LR tracking, and student/member workflows right on your phone.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/30">
              <BellRing className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">1-Tap WhatsApp Alerts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send gentle, urgent, or final payment escalation notices with your dynamic UPI payment link pre-attached.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center text-amber-400 mb-3 border border-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Spot Counter QR Codes</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show a high-resolution dynamic UPI QR code on your phone screen for instant zero-friction payment collection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-600/30 flex items-center justify-center text-sky-400 mb-3 border border-sky-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Live Cloud Synchronization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All records, party ledgers, and audit logs sync instantly between your web portal and Android/iOS app.
            </p>
          </div>
        </div>

        {/* 3 Real Mobile App Screenshots Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {/* Screen 1: Workspace Dashboard */}
          <div className="flex flex-col items-center group">
            <div className="w-full max-w-[280px] rounded-[36px] p-2 bg-slate-800/80 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/80 transform group-hover:-translate-y-2 transition-transform duration-300">
              <div className="rounded-[28px] overflow-hidden bg-slate-950 border border-slate-700/60 aspect-[9/19] flex items-center justify-center">
                <img 
                  src="/mobile_workspace.png" 
                  alt="KwikBill Mobile Workspace Dashboard" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">Live Workspace</span>
              <span className="text-sm font-extrabold text-white">Revenue & Outstanding KPIs</span>
            </div>
          </div>

          {/* Screen 2: Invoices & 1-Tap WhatsApp (Highlighted center) */}
          <div className="flex flex-col items-center group md:-mt-4">
            <div className="w-full max-w-[290px] rounded-[38px] p-2.5 bg-gradient-to-b from-indigo-600 via-indigo-900 to-slate-900 border-2 border-indigo-400 shadow-2xl shadow-indigo-600/30 transform group-hover:-translate-y-2 transition-transform duration-300">
              <div className="rounded-[28px] overflow-hidden bg-slate-950 border border-slate-700/60 aspect-[9/19] flex items-center justify-center">
                <img 
                  src="/mobile_invoices.png" 
                  alt="KwikBill Mobile Invoice Management & WhatsApp" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">1-Tap Actions</span>
              <span className="text-sm font-extrabold text-white">Invoices, WhatsApp & Settlement</span>
            </div>
          </div>

          {/* Screen 3: GST Invoice Creator */}
          <div className="flex flex-col items-center group">
            <div className="w-full max-w-[280px] rounded-[36px] p-2 bg-slate-800/80 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/80 transform group-hover:-translate-y-2 transition-transform duration-300">
              <div className="rounded-[28px] overflow-hidden bg-slate-950 border border-slate-700/60 aspect-[9/19] flex items-center justify-center">
                <img 
                  src="/mobile_create.png" 
                  alt="KwikBill Mobile GST Invoice Creation" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">Industry Presets</span>
              <span className="text-sm font-extrabold text-white">Transport, Gym & GST Builder</span>
            </div>
          </div>
        </div>

        {/* APK / Mobile Ready CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl mx-auto">
            <img 
              src="/logo.png" 
              alt="KwikBill Pro App Icon" 
              className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-white/20 shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <h4 className="text-sm font-bold text-white">Standalone Android & iOS App Available</h4>
              <p className="text-xs text-slate-400">Available as installable APK and Expo Go mobile client.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Android Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
