import React, { useState } from 'react';
import { TrendingUp, Users, IndianRupee, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface RoiCalculatorProps {
  onLaunchApp: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onLaunchApp }) => {
  const [customerCount, setCustomerCount] = useState<number>(100);
  const [selectedPlan, setSelectedPlan] = useState<299 | 499>(299);

  // Math models from user brief
  const monthlyRevenue = customerCount * selectedPlan;
  const annualRevenue = monthlyRevenue * 12;

  // Lakh formatting helper
  const formatIndianCurrency = (num: number) => {
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(2);
      return `₹${lakhs} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <section id="calculator" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Revenue Scaling & Unit Economics
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            SaaS Unit Economics: From 100 to 500+ Customers
          </h2>
          <p className="mt-3 text-base text-slate-600">
            See the exact recurring monthly revenue (MRR) benchmarks powered by the ₹299 and ₹499 pricing tiers.
          </p>
        </div>

        {/* Interactive Math Playground */}
        <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Subscription Plan Tier:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(299)}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${selectedPlan === 299
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div>₹299 / month</div>
                    <span className="text-[11px] font-normal opacity-80">Starter Small Biz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan(499)}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${selectedPlan === 499
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div>₹499 / month</div>
                    <span className="text-[11px] font-normal opacity-80">Growth + Auto WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Slider for Customer count */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Business Customers:
                  </label>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg font-mono font-bold text-sm border border-indigo-500/30">
                    {customerCount} Customers
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                  <span>10 (Early Stage)</span>
                  <button
                    type="button"
                    onClick={() => setCustomerCount(100)}
                    className="hover:text-indigo-400 underline font-semibold"
                  >
                    100 (₹29.9k Benchmark)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerCount(500)}
                    className="hover:text-indigo-400 underline font-semibold"
                  >
                    500 (₹1.5L Benchmark)
                  </button>
                  <span>1,000+</span>
                </div>
              </div>

              {/* Benchmark Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">100 Customers @ ₹299:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">₹29,900 / month</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">500 Customers @ ₹299/499:</span>
                  <span className="text-indigo-400 font-bold font-mono text-sm">₹1.5 Lakh / month</span>
                </div>
              </div>
            </div>

            {/* Right Output Dashboard */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-800 to-slate-850 p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Estimated Recurring Revenue
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {formatIndianCurrency(monthlyRevenue)}
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">/ month</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  {formatIndianCurrency(annualRevenue)} / year (ARR)
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-700/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Payment Gateway Friction via Direct UPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sub-2 minute invoice to WhatsApp delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated 4-tier reminder escalations</span>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                id="calc-cta-start-workspace"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/40 transition-all hover:scale-[1.02]"
              >
                <span>Try Live Workspace For Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
