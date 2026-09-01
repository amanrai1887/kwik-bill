import React from 'react';
import { Check, Zap, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface PricingSectionProps {
  onSelectPricing: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPricing }) => {

  return (
    <section id="pricing" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Transparent SaaS Pricing</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Simple, High-ROI Plans for Growing Businesses
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Start with our 15-Day Free Trial or choose a dedicated monthly subscription. Keep 100% of your invoice earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Plan 1: 15-Day Free Trial */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Risk-Free Start</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  15-Day Trial
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                <span className="text-slate-500 text-sm font-medium">/ 15 days</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Test drive full GST invoicing, customer directory and 1-click WhatsApp alerts with zero upfront commitment.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>15 Days Full App Access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Invoices + UPI QR Code</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Payment Reminders</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cloud Database Isolation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onSelectPricing}
                id="pricing-trial-cta"
                className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-200 cursor-pointer"
              >
                <span>Start 15-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Plan 2: ₹299/mo Starter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Solo & Freelancers
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹299</span>
                <span className="text-slate-500 text-sm font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Ideal for independent transport owners, solo agencies, and consultants managing recurring billings.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Unlimited GST & Non-GST Invoices</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>1-Click WhatsApp Payment Reminders</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Dynamic Instant UPI QR Code Generation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Monthly Collection Summary Reports</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onSelectPricing}
                id="pricing-starter-cta"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer"
              >
                <span>Get Started with ₹299 Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Plan 3: ₹499/mo Pro Growth (Featured) */}
          <div className="rounded-2xl border-2 border-indigo-600 bg-white p-6 sm:p-7 flex flex-col justify-between relative shadow-lg shadow-indigo-600/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
              Most Popular • Best Value
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Pro Growth Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Full Automation Suite
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">₹499</span>
                <span className="text-slate-500 text-sm font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Designed for transport fleets, agencies with multiple client retainers, and fast-scaling service providers.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-bold text-indigo-700">🤖 KwikBill AI Agent (Gemini Powered)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-900">Everything in Starter Plan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>Automated 4-Tier Reminder Escalation</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Transport Module: LR, Bilty & POD tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>6-Month Revenue Trends & CA-Ready CSV</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onSelectPricing}
                id="pricing-pro-cta"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Launch Pro Workspace (₹499)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

