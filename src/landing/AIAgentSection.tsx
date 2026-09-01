import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  Zap,
  Database,
  ShieldCheck,
  Send,
  Download,
  ExternalLink,
} from 'lucide-react';

interface AIAgentSectionProps {
  onLaunchDemo?: () => void;
  onSelectPricing?: () => void;
}

export const AIAgentSection: React.FC<AIAgentSectionProps> = ({ onLaunchDemo, onSelectPricing }) => {
  const steps = [
    {
      id: 'query',
      prompt: 'Show me unpaid invoices from last month.',
      aiResponse: 'Found 3 unpaid invoices from last month totaling ₹1,47,500:',
      cardType: 'invoices',
      invoices: [
        { id: 'INV-2026-089', client: 'ABC Traders', amount: '₹50,000', due: '15 Aug', status: 'overdue' },
        { id: 'INV-2026-091', client: 'XYZ Logistics', amount: '₹47,500', due: '22 Aug', status: 'overdue' },
        { id: 'INV-2026-095', client: 'Apex Transways', amount: '₹50,000', due: '28 Aug', status: 'pending' },
      ],
    },
    {
      id: 'create',
      prompt: 'Create an invoice for ABC Traders for ₹50,000.',
      aiResponse: 'I have drafted invoice INV-2026-102 for ABC Traders totaling ₹50,000. Please confirm to record in database:',
      cardType: 'confirmation',
      confirmation: {
        party: 'ABC Traders',
        subtotal: '₹50,000',
        gst: '₹0 (Pending)',
        total: '₹50,000',
      },
    },
    {
      id: 'gst',
      prompt: 'Add 18% GST.',
      aiResponse: 'Updated! Added 18% GST (₹9,000). Total payable is now ₹59,000.',
      cardType: 'taxUpdated',
      taxDetails: {
        subtotal: '₹50,000',
        gst: '₹9,000 (18%)',
        total: '₹59,000',
      },
    },
    {
      id: 'pdf',
      prompt: 'Generate PDF.',
      aiResponse: 'Rendered print-ready GST Tax Invoice PDF with QR code & bank details.',
      cardType: 'pdf',
      pdfName: 'Invoice_INV-2026-102.pdf',
    },
    {
      id: 'whatsapp',
      prompt: 'Send it through WhatsApp.',
      aiResponse: '✅ Invoice INV-2026-102 with live payment link dispatched to ABC Traders (+91 98111 22233)!',
      cardType: 'whatsapp',
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  // Auto-advance through demo conversation steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section id="ai-agent" className="py-20 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Introducing KwikBill AI Agent 2.0</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Talk to Your Invoices. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
              Zero Manual Data Entry.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Manage your entire billing pipeline in natural plain English or Hinglish. From querying overdue accounts to drafting GST invoices, adding taxes, generating PDFs, and sending WhatsApp reminders in seconds.
          </p>
        </div>

        {/* Main Interactive Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
                <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct PostgreSQL Tool Execution</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Agent queries real database rows with structured filters for status, date ranges, and party names.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
                <div className="p-2.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Financial Safety Confirmations</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Never makes accidental writes. Always presents interactive cards to confirm invoice creation or settlements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
                <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Headless Puppeteer PDF & WhatsApp</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creates pixel-perfect PDF documents server-side and triggers WhatsApp messages with instant UPI payment links.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Step Switcher Tabs */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Experience the 5-step workflow:
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all text-center truncate ${activeStepIndex === idx
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    Step {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onSelectPricing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>Try KwikBill AI on Pro Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Simulated Chat Interface */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Chat Window Titlebar */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">KwikBill AI Live Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gemini 3.6 Flash</span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-5 space-y-4 min-h-[380px] flex flex-col justify-between">
                <div className="space-y-4">
                  {/* User Turn */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-sm shadow-md font-medium">
                      "{activeStep.prompt}"
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  </div>

                  {/* AI Turn */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-200 max-w-md space-y-3 shadow-md">
                      <p className="leading-relaxed">{activeStep.aiResponse}</p>

                      {/* Render step specific UI card */}
                      {activeStep.cardType === 'invoices' && (
                        <div className="space-y-2 pt-1">
                          {activeStep.invoices?.map((inv, i) => (
                            <div
                              key={i}
                              className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{inv.id}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 bg-red-950/80 text-red-400 border border-red-800/60 rounded font-bold uppercase">
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {inv.client} • Due {inv.due}
                                </div>
                              </div>
                              <span className="font-extrabold text-amber-400 text-xs">{inv.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeStep.cardType === 'confirmation' && (
                        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2">
                          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Create in PostgreSQL
                          </div>
                          <div className="text-[10px] text-slate-300 space-y-1 bg-slate-950 p-2 rounded-lg border border-amber-900/40">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Party:</span>
                              <span className="font-bold text-white">{activeStep.confirmation?.party}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Subtotal:</span>
                              <span>{activeStep.confirmation?.subtotal}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-indigo-400">
                              <span>Total:</span>
                              <span>{activeStep.confirmation?.total}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep.cardType === 'taxUpdated' && (
                        <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-[11px] space-y-1.5">
                          <div className="flex justify-between text-slate-400">
                            <span>Base Subtotal:</span>
                            <span className="font-semibold text-white">{activeStep.taxDetails?.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>GST Added (18%):</span>
                            <span className="font-semibold text-emerald-400">+{activeStep.taxDetails?.gst}</span>
                          </div>
                          <div className="flex justify-between border-t border-indigo-900/80 pt-1.5 font-bold text-xs text-white">
                            <span>Recalculated Total:</span>
                            <span className="text-amber-400">{activeStep.taxDetails?.total}</span>
                          </div>
                        </div>
                      )}

                      {activeStep.cardType === 'pdf' && (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <div>
                              <div className="font-bold text-white text-xs">{activeStep.pdfName}</div>
                              <div className="text-[10px] text-emerald-400">Puppeteer Headless Render • 142 KB</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Download className="w-3 h-3" /> Download
                          </span>
                        </div>
                      )}

                      {activeStep.cardType === 'whatsapp' && (
                        <div className="p-3 bg-green-950/40 border border-green-800/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="font-bold text-white text-xs">WhatsApp Cloud API Delivery</div>
                              <div className="text-[10px] text-green-400">Delivered • Includes UPI Payment Portal Link</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-600/30 text-green-300 border border-green-700/60 rounded text-[10px] font-bold">
                            Delivered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Input Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
                    <span className="truncate">Ask AI to query invoices, create bills, or send reminders...</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded border border-slate-700">⌘K</kbd>
                  </div>
                  <button className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
