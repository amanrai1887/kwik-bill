import React, { useState } from 'react';
import { Truck, Megaphone, Laptop, Briefcase, Dumbbell, GraduationCap, ShoppingBag, Check, ArrowRight, MessageSquare, IndianRupee, Shield } from 'lucide-react';

export const TargetIndustries: React.FC<{ onSelectIndustry?: (industry: string) => void }> = ({ onSelectIndustry }) => {
  const [activeTab, setActiveTab] = useState<'transport' | 'agency' | 'gym' | 'coaching' | 'retail' | 'freelancer' | 'consultant'>('transport');

  const industries = [
    {
      id: 'transport',
      title: 'Transport & Logistics',
      icon: Truck,
      tagline: 'Manage Truck Freights, LR/Bilty numbers, routes & instant WhatsApp payment alerts.',
      accent: 'emerald',
      benefits: [
        'Vehicle Number & Driver POD tracking on each invoice',
        'LR (Lorry Receipt) & Bilty reference fields with E-way tags',
        'WhatsApp reminders sent directly to consignee or broker',
        'GST 5% / 12% freight tax slab support',
      ],
      sampleInvoice: {
        number: 'INV-TR-882',
        client: 'Rajesh Logistics Corp (Navi Mumbai)',
        item: '18T Heavy Container: JNPT → Ahmedabad',
        subtotal: '₹48,000',
        tax: '₹5,760 (12% GST)',
        total: '₹53,760',
        status: 'Overdue (5 Days)',
        whatsappMsg: '🚚 *Rajesh Logistics Corp*: Payment for Truck MH-04-GP-8842 (LR-994201) of ₹53,760 is overdue. Settle via UPI: speedytrans@okaxis',
      },
    },
    {
      id: 'gym',
      title: 'Gyms & Fitness Studios',
      icon: Dumbbell,
      tagline: 'Automate membership subscription fees, personal trainer dues & renewal alerts.',
      accent: 'rose',
      benefits: [
        'Member ID tracking & Quarterly/Annual membership renewals',
        'Personal training & supplement addon billing',
        'Automated expiry alerts 3 days before gym pass ends',
        'Instant UPI QR code on receipt for instant front-desk collection',
      ],
      sampleInvoice: {
        number: 'INV-GYM-104',
        client: 'Vikram Mehta (Gold Member #GM-902)',
        item: 'Quarterly Gym Membership + Personal Trainer (3 Mo)',
        subtotal: '₹9,500',
        tax: '₹1,710 (18% GST)',
        total: '₹11,210',
        status: 'Due in 2 Days',
        whatsappMsg: '🏋️‍♂️ *Vikram*: Your Gym Membership (#GM-902) expires on 25th Aug. Renew now for uninterrupted access: ₹11,210 via UPI: ironfit@oksbi',
      },
    },
    {
      id: 'coaching',
      title: 'Coaching & Tuition Centers',
      icon: GraduationCap,
      tagline: 'Manage student batches, term installments, admission receipts & parent payment alerts.',
      accent: 'indigo',
      benefits: [
        'Student Roll No & Course Batch tags on each invoice',
        'Term-wise fee installments (1st/2nd/3rd Installment tracking)',
        'Polite WhatsApp payment reminders sent directly to parents',
        'GST exemption or custom GST billing supported',
      ],
      sampleInvoice: {
        number: 'INV-EDU-551',
        client: 'Sunil Sharma (Parent of Rahul Sharma - Class 12)',
        item: 'JEE Main & Advanced Physics Term 2 Installment',
        subtotal: '₹18,000',
        tax: '₹0 (Educational Exemption)',
        total: '₹18,000',
        status: 'Due Today',
        whatsappMsg: '📚 *Sunil Sharma Ji*: Term 2 fee installment of ₹18,000 for Rahul (Roll STU-89) is due today. Settle via UPI: apexclasses@icici',
      },
    },
    {
      id: 'retail',
      title: 'Retail Shops & Kirana',
      icon: ShoppingBag,
      tagline: 'Counter billing, warranty tracking, customer khata balances & quick bill prints.',
      accent: 'amber',
      benefits: [
        'Counter POS bill numbering with serial warranty tracking',
        'Itemized barcode/HSN breakdown and instant thermal print',
        'Customer credit ledger (Khata balance reminders)',
        'Direct UPI QR Code printed right on the bill',
      ],
      sampleInvoice: {
        number: 'INV-RET-309',
        client: 'Manoj General Store (Pune)',
        item: 'Wholesale Electronics & Home Appliances (3 Items)',
        subtotal: '₹24,500',
        tax: '₹4,410 (18% GST)',
        total: '₹28,910',
        status: 'Paid Instantly',
        whatsappMsg: '🛍️ *Manoj Ji*: Bill #INV-RET-309 for ₹28,910 generated at POS-01. Warranty valid for 1 Year. Thank you for shopping with us!',
      },
    },
    {
      id: 'agency',
      title: 'Agencies & Studios',
      icon: Megaphone,
      tagline: 'Track monthly retainers, client milestones, TDS deductions, and recurring billings.',
      accent: 'indigo',
      benefits: [
        'Itemized retainer milestones & hourly campaign billing',
        'TDS (Section 194J) automatic deduction calculation',
        'Scheduled reminder alerts before the 1st of every month',
        'Clear payment status: Paid, Pending & Partial advance',
      ],
      sampleInvoice: {
        number: 'INV-AG-402',
        client: 'Apex Creative Media LLP',
        item: 'Q3 Social Media Ads & Creative Production',
        subtotal: '₹75,000',
        tax: '+ ₹13,500 GST / - ₹7,500 TDS',
        total: '₹81,000',
        status: 'Due in 3 Days',
        whatsappMsg: '🎨 *Apex Media*: Retainer Invoice #INV-AG-402 for ₹81,000 is ready. Thank you for your partnership! UPI: apex@icici',
      },
    },
    {
      id: 'freelancer',
      title: 'Freelancers & Creators',
      icon: Laptop,
      tagline: 'Zero-hassle instant UPI invoicing with direct WhatsApp payment links for devs & designers.',
      accent: 'blue',
      benefits: [
        'Generate and send professional invoices in under 30 seconds',
        'Direct UPI QR Code + `upi://pay` click link for zero fees',
        'Automatic client ledger showing who owes you what',
        'Polite & friendly reminder templates with 1-click wa.me',
      ],
      sampleInvoice: {
        number: 'INV-FL-109',
        client: 'FinTech Labs Inc (Bengaluru)',
        item: 'React UI Architecture & Frontend Sprint',
        subtotal: '₹35,000',
        tax: '₹6,300 (18% GST)',
        total: '₹41,300',
        status: 'Paid Instantly',
        whatsappMsg: '💻 *FinTech Labs*: Here is the invoice for the React Sprint: ₹41,300. Instant UPI Link: developer@oksbi. Thank you!',
      },
    },
    {
      id: 'consultant',
      title: 'Consultants & CA/Advisors',
      icon: Briefcase,
      tagline: 'Formal advisory fee bills, session hour logs, advance retainers, and GST compliance.',
      accent: 'amber',
      benefits: [
        'Hourly advisory rate or fixed quarterly retainer billing',
        'Record 50% advance settlements with partial payment tracking',
        'Download clean, printable GST compliant PDF invoices',
        'Monthly collection efficiency and income reports',
      ],
      sampleInvoice: {
        number: 'INV-CS-901',
        client: 'Singhania Enterprise Advisory',
        item: 'Quarterly Supply Chain Audit & Strategy (4 Sessions)',
        subtotal: '₹1,20,000',
        tax: '₹21,600 (18% GST) - ₹12,000 TDS',
        total: '₹1,29,600 (₹60k Adv Received)',
        status: 'Partial Payment',
        whatsappMsg: '📊 *Dr. Singhania*: Summary for advisory sessions invoice: Balance ₹69,600 pending. Direct bank/UPI settlement enabled.',
      },
    },
  ];


  const current = industries.find((i) => i.id === activeTab)!;

  return (
    <section id="target-industries" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Tailored Workflows</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Built Specifically For 4 Key Small Business Segments
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Every business type has unique billing requirements. Select your industry to see tailored presets and WhatsApp templates.
          </p>
        </div>

        {/* 4 Industry Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isActive = activeTab === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveTab(ind.id as any)}
                id={`tab-industry-${ind.id}`}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-600/10'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{ind.title}</h3>
                  <span className="text-[10px] text-slate-500">{isActive ? 'Active Preview' : 'Click to View'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Features */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <current.icon className="w-4 h-4 text-indigo-600" />
                {current.title}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                {current.tagline}
              </h3>
              <ul className="space-y-3">
                {current.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Col: Live Generated Sample Card */}
            <div className="lg:col-span-6 bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Generated Sample: {current.sampleInvoice.number}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                  {current.sampleInvoice.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Consignee:</span>
                  <span className="font-semibold text-slate-900">{current.sampleInvoice.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billed Service:</span>
                  <span className="font-medium text-slate-800">{current.sampleInvoice.item}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal & Taxes:</span>
                  <span className="text-slate-600">{current.sampleInvoice.tax}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">Total Payable:</span>
                  <span className="font-bold text-indigo-600 text-base">{current.sampleInvoice.total}</span>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Automated WhatsApp Reminder
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-emerald-900 bg-white/70 p-2.5 rounded border border-emerald-100">
                  {current.sampleInvoice.whatsappMsg}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
