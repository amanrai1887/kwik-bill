import React from 'react';
import { FileText, MessageSquare, CheckCircle, BarChart3, Repeat, Globe, Sparkles, Palette, Zap } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Palette,
      tag: '1. Templates & Brand Studio',
      title: '🎨 6 Pro Invoice Templates & Custom Logo',
      description:
        'Personalize your invoices to look world-class. Choose from 6 designer styles (Modern Minimalist, Corporate Executive, Emerald Logistics, Creative Gradient, Classic CA Standard, Dark Neon Pro), upload company logo, and pick custom brand accent colors.',
      points: [
        '6 Industry-crafted HTML/CSS invoice templates',
        'Company logo upload & brand accent color palette',
        'Personalized legal terms & footer disclaimers',
      ],
      highlight: true,
    },
    {
      icon: Repeat,
      tag: '2. Auto-Billing & Retainers',
      title: '🔁 Recurring Invoices on Autopilot',
      description:
        'Set up automated recurring billing schedules (Weekly, Monthly, Quarterly, Yearly) for retainer clients, subscriptions, gym memberships, or freight routes. Invoices generate on schedule with automatic WhatsApp dispatch.',
      points: [
        'Automated background cron generator engine',
        'Predictable Monthly Inflow (MRR) live tracker',
        'Auto-sends WhatsApp alerts upon invoice issue',
      ],
      highlight: false,
    },
    {
      icon: Globe,
      tag: '3. Client Experience',
      title: '🌐 Public Invoice & Instant Pay Portal',
      description:
        'Clients receive a secure, branded link (`/pay/INV-XXXX`) where they can view itemized GST tax invoices, copy bank IFSC details, scan UPI QR codes directly from any mobile or desktop browser without downloading an app.',
      points: [
        'Browser-based live payment & PDF download',
        'Dynamic UPI QR code with instant app deep-links',
        'Zero app download required for customers',
      ],
      highlight: false,
    },
    {
      icon: MessageSquare,
      tag: '4. WhatsApp Payment Reminders',
      title: '💬 1-Click WhatsApp Delivery & Escalations',
      description:
        'Send polite, friendly, or urgent payment reminders directly to client WhatsApp numbers via official `wa.me` links. Escalation sequences guarantee faster recovery with zero manual awkwardness.',
      points: [
        '4 Escalation Tiers (Polite Reminder to Final Legal Notice)',
        'Direct deep-link `wa.me` generation with custom templates',
        'Real-time audit log of all dispatched reminders',
      ],
      highlight: false,
    },
    {
      icon: FileText,
      tag: '5. Fast GST & Industry Presets',
      title: '⚡ 45-Second GST Invoicing',
      description:
        'Create professional GST-compliant tax invoices in under 45 seconds with preconfigured industry workflows for Transport (LR & Vehicle No), Agencies (Milestones), Gyms (Member IDs), Coaching, and Retail POS.',
      points: [
        'Industry fields for Logistics, Agencies, Gyms & Retail',
        'Auto GST 5%, 12%, 18%, 28% + TDS 194C/194J calculations',
        'Printable PDF and clean official invoice layouts',
      ],
      highlight: false,
    },
    {
      icon: BarChart3,
      tag: '6. CA Reports & Analytics',
      title: '📈 Monthly Reports & GSTR-1 Summaries',
      description:
        'Visualize your cash inflows, collection efficiency rate, and tax liabilities. Export CA-ready monthly reconciliation sheets and GSTR-1 summaries in 1-click.',
      points: [
        'Interactive 6-month collection trajectory charts',
        'GST collection & TDS summary reports',
        '1-Click CSV/JSON CA export sheets',
      ],
      highlight: false,
    },
  ];


  return (
    <section id="features" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
            Cutting-Edge SaaS Features
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Everything You Need To Automate Billing & Get Paid
          </h2>
          <p className="mt-3 text-base text-slate-600">
            From scheduled recurring retainers to instant public payment links, KwikBill equips your business with best-in-class financial automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-6 sm:p-7 hover:shadow-lg transition-all flex flex-col justify-between ${
                  feature.highlight
                    ? 'bg-gradient-to-b from-indigo-900/5 to-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        feature.highlight
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        feature.highlight
                          ? 'bg-indigo-100 text-indigo-800 font-extrabold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {feature.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

