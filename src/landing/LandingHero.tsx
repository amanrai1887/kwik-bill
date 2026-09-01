import React from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, FileText, TrendingUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface LandingHeroProps {
  onLaunchDemo: () => void;
  onSelectPricing: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLaunchDemo, onSelectPricing }) => {

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 bg-white">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Built for Indian Small Businesses & Freelancers
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Auto-Bill Retainers. <br />
            <span className="text-indigo-600">Collect 3x Faster</span> on WhatsApp.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            The automated invoicing & recurring revenue platform for
            <strong className="text-slate-900 font-semibold"> Transport Fleets, Agencies, Gyms, Institutes & Freelancers</strong>.
            Auto-generate recurring contracts, deliver instant public payment links, and trigger 1-click WhatsApp alerts with zero friction.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSelectPricing}
              id="hero-get-started-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-200 fill-current" />
              <span>Launch Free Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span>Explore Live Demo Mode</span>
            </button>
          </div>


          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" /> 🤖 KwikBill AI Agent (⌘K)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 🎨 6 Pro Templates & Logo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 🔁 Auto-Recurring Cron Engine
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 💬 1-Click WhatsApp Reminders
            </span>
          </div>


        </div>

        {/* Live Interactive Mockup Frame */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden p-2 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  ST
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Speedy Transport Logistics</h4>
                  <p className="text-xs text-slate-500">MH-04 Fleet Corridors • Active GSTIN: 27AABCU9603R1ZN</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Live WhatsApp Engine
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ₹499/mo Plan
                </span>
              </div>
            </div>

            {/* Quick 3-card preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Recurring Retainer Engine */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-600" /> 🔁 Auto-Billing Engine
                    </span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-bold">Monthly Retainer</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Rajesh Logistics Retainer</span>
                      <span className="text-indigo-600">₹47,040</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Next Run: 19th Sep 2026</span>
                      <span className="text-emerald-600 font-semibold">Auto-Cron Active</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-indigo-700 font-medium">
                  ✓ 100% automated scheduled invoicing
                </div>
              </div>

              {/* Card 2: Public Customer Payment Portal */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-2">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp + Public Pay Link
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">/pay/INV-1125</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs text-slate-700 space-y-1.5 shadow-2xs font-mono">
                    <p className="text-slate-900 font-bold">Dear Rajesh Logistics,</p>
                    <p>Bill #INV-2026-1125 for <strong>₹47,040</strong> is generated.</p>
                    <p className="text-emerald-700 font-semibold underline text-[11px]">kwikbill.io/pay/INV-2026-1125</p>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                  ✓ Instant UPI QR + Bank IFSC on web
                </div>
              </div>

              {/* Card 3: Revenue Analytics & Predictable MRR */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" /> Predictable Inflow & MRR
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Live Metrics</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Monthly Run Rate:</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">₹1,41,120/mo</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>3 Active Retainers</span>
                      <span className="text-indigo-600 font-bold">92% Recovery</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-600 font-medium">
                  ✓ Automated cash flow projections
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
