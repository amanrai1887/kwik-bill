import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle, 
  Zap, 
  BellRing, 
  QrCode, 
  ShieldCheck, 
  Layers, 
  Palette, 
  Repeat, 
  FileText,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface AppScreen {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  image: string;
  badge: string;
  color: string;
  description: string;
  features: string[];
}

export const MobileAppSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const screens: AppScreen[] = [
    {
      id: 'workspace',
      title: 'Live Workspace & KPIs',
      category: 'Command Center',
      subtitle: 'Realized Revenue & Cash Flow Projections',
      image: '/app_screen_workspace.png',
      badge: 'Real-time KPIs',
      color: 'from-indigo-500 to-purple-600',
      description: 'Track realized revenue, overdue exposure, 7-day & 30-day cash flow forecasts, and auto-billing schedules on the go.',
      features: [
        'Instant total realized revenue & collection percentage',
        'Overdue exposure tracking with automated aging breakdown (0-15d, 16-30d, 60d+)',
        'Cash flow forecast algorithm predicting expected inflows',
      ],
    },
    {
      id: 'invoices',
      title: 'Invoice List & 1-Tap WhatsApp',
      category: 'Receivables Engine',
      subtitle: 'Instant WhatsApp Reminders & Settlement',
      image: '/app_screen_invoices.png',
      badge: '1-Tap Escalations',
      color: 'from-emerald-500 to-teal-600',
      description: 'Review invoice statuses, trigger WhatsApp payment notices with dynamic UPI links pre-attached, and record settlements in one tap.',
      features: [
        'Filter by All, Pending, and Settled receivables instantly',
        '1-Tap WhatsApp button with multi-tone reminder templates',
        'Instant settlement reconciliation updating cloud ledgers live',
      ],
    },
    {
      id: 'branding',
      title: '6 Invoice Templates & Multi-Language',
      category: 'Custom Branding',
      subtitle: 'Modern, Corporate, Logistics, Creative, Classic, Dark Neon',
      image: '/app_screen_branding.png',
      badge: 'Full White-Label',
      color: 'from-purple-500 to-pink-600',
      description: 'Customize invoice layouts, pick brand accent colors, upload company logos, and switch interface language to Hindi, Gujarati, or Marathi.',
      features: [
        '6 Dynamic invoice templates with custom brand color palettes',
        'Multi-language UI (English, हिन्दी, ગુજરાતી, मराठी)',
        'Custom invoice disclaimer & bank wire instructions footer',
      ],
    },
    {
      id: 'recurring',
      title: 'Recurring Retainers & Auto-Billing',
      category: 'Autopilot Revenue',
      subtitle: 'Automated Contracts & Run-Rate Monitor',
      image: '/app_screen_recurring.png',
      badge: 'Autonomous Cron',
      color: 'from-amber-500 to-orange-600',
      description: 'Set up recurring retainer billing with automated invoice generation and scheduled WhatsApp delivery.',
      features: [
        'Monthly run-rate calculator and active schedule tracker',
        'Hourly background cron scanning and auto-generating invoices',
        '1-Tap manual billing scan trigger with live generation count',
      ],
    },
    {
      id: 'create',
      title: 'GST Rule 46 Compliant Creator',
      category: 'Tax Engine',
      subtitle: 'Place of Supply, RCM & Industry Presets',
      image: '/app_screen_create.png',
      badge: '100% Tax Compliant',
      color: 'from-sky-500 to-indigo-600',
      description: 'Create compliant GST invoices with 36 state codes, reverse charge toggles, HSN/SAC codes, and tailored industry parameters.',
      features: [
        '36 Indian State & UT Place of Supply chips with auto-detection',
        'Reverse Charge (RCM) declaration & intra/inter-state tax split',
        'Industry presets: Transport (Vehicle/LR), Gym, Coaching, Retail, Agency',
      ],
    },
  ];

  const current = screens[activeTab];

  return (
    <section id="mobile-app" className="py-24 bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-950 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>KwikBill Mobile Pro (Android & iOS)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Entire Billing Command Center{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              In the Palm of Your Hand
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Generate compliant GST invoices in 30 seconds, trigger 1-tap WhatsApp reminders with dynamic UPI QR codes, and automate retainer contracts anywhere, anytime.
          </p>
        </div>

        {/* Interactive Screen Tabs */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl gap-1 sm:gap-2">
            {screens.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === idx
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{screen.title.split('&')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Showcase Hero: Dynamic Phone + Feature Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Phone Mockup Frame with Selected Screen */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="w-[280px] sm:w-[310px] rounded-[44px] p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-indigo-500/40 shadow-2xl shadow-indigo-950/80 transform group-hover:scale-[1.01] transition-transform duration-300">
                  {/* Phone Speaker Notch */}
                  <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 border border-slate-800" />
                  
                  {/* High-Res Screen Container */}
                  <div className="rounded-[32px] overflow-hidden bg-slate-950 border border-slate-700/80 aspect-[9/19.5] flex items-center justify-center relative shadow-inner">
                    <img
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating Floating Accent Badge */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-slate-900/95 border border-indigo-400/40 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md hidden sm:flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Status</span>
                    <span className="text-xs font-black text-white">{current.badge}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature Highlights for the Selected Screen */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <span>{current.category}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-sm sm:text-base text-indigo-200/90 font-medium">
                  {current.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  {current.description}
                </p>
              </div>

              {/* Feature Points */}
              <div className="space-y-3 pt-2">
                {current.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-normal">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Quick Screen Selector Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Browse All 5 App Sections:
                </span>
                <div className="flex flex-wrap gap-2">
                  {screens.map((scr, idx) => (
                    <button
                      key={scr.id}
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === idx
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {idx + 1}. {scr.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Screen Panoramic Carousel Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Full Screen Gallery</h4>
              <p className="text-xs text-slate-400">Tap any screen below to preview details</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider hidden sm:block">5 Production Screens</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {screens.map((scr, idx) => (
              <div
                key={scr.id}
                onClick={() => setActiveTab(idx)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer group text-center ${
                  activeTab === idx
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="rounded-xl overflow-hidden aspect-[9/18] bg-slate-950 mb-2 border border-slate-800 relative group-hover:opacity-90">
                  <img src={scr.image} alt={scr.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-200 block truncate">{scr.title}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{scr.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Ready Bottom Bar */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl mx-auto">
            <img 
              src="/logo.png" 
              alt="KwikBill Pro App Icon" 
              className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-white/20 shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <h4 className="text-sm font-bold text-white">Built with React Native & Expo</h4>
              <p className="text-xs text-slate-400">Full offline UPI QR generation, biometric security, and cloud sync.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Android & iOS Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
