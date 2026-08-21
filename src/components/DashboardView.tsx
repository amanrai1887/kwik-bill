import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  MessageSquare, 
  ArrowUpRight, 
  IndianRupee, 
  FileText,
  Truck,
  Users,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Invoice, AnalyticsData, UserProfile } from '../lib/types.ts';

interface DashboardViewProps {
  analytics: AnalyticsData | null;
  invoices: Invoice[];
  profile: UserProfile | null;
  onCreateInvoice: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onViewAllInvoices: () => void;
  onOpenPlanModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  invoices,
  profile,
  onCreateInvoice,
  onOpenInvoice,
  onSendReminder,
  onViewAllInvoices,
  onOpenPlanModal,
}) => {
  const metrics = analytics?.metrics || {
    totalInvoiced: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalInvoicesCount: 0,
    totalClientsCount: 0,
    collectionRate: 0,
  };

  const trendData = analytics?.trendData || [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const recentInvoices = safeInvoices.slice(0, 5);


  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const isTrial = profile?.subscriptionPlan === 'trial_15_days' || profile?.subscriptionStatus === 'trial';
  
  // Calculate remaining trial days
  let remainingTrialDays = 15;
  if (profile?.trialEndsAt) {
    const diffTime = new Date(profile.trialEndsAt).getTime() - Date.now();
    remainingTrialDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Time of day dynamic personalized greeting
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const personName = profile?.ownerName || profile?.businessName || 'Merchant';

  return (
    <div className="space-y-6">
      {/* 15-Day Free Trial Notice Banner */}
      {isTrial && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">15-Day Free Trial Active</span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase">
                  {remainingTrialDays} Days Remaining
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                You have full unrestricted access to test GST invoicing, client directories, and WhatsApp payment reminders.
              </p>
            </div>
          </div>
          {onOpenPlanModal ? (
            <button
              type="button"
              onClick={onOpenPlanModal}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-xs hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
            >
              Upgrade Plan (₹299 / ₹499)
            </button>
          ) : (
            <a
              href="#settings"
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-xs hover:bg-emerald-50 transition-colors shrink-0"
            >
              Upgrade Plan (₹299 / ₹499)
            </a>
          )}
        </div>
      )}

      {/* Top Banner / Welcome with Personalized Greeting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {timeGreeting}, <span className="text-indigo-600 dark:text-indigo-400">{personName}!</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase">
              {profile?.subscriptionPlan === 'trial_15_days' ? '15-Day Free Trial' : profile?.subscriptionPlan === 'pro_499' ? '₹499 Pro Plan' : '₹299 Starter Plan'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {metrics.totalPending > 0 ? (
              <>
                You have <strong className="text-amber-600 dark:text-amber-400 font-semibold">{formatCurrency(metrics.totalPending)}</strong> pending collection across your clients today.
              </>
            ) : (
              'All invoices are fully settled! Real-time billing & collection dashboard.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateInvoice}
            id="dashboard-create-invoice-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
            <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-700/80 text-indigo-100">
              N
            </kbd>
          </button>
        </div>
      </div>


      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.totalInvoiced)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{metrics.totalInvoicesCount} invoices generated</span>
            </div>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(metrics.totalCollected)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <span>{metrics.collectionRate}% collection efficiency</span>
            </div>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Dues</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(metrics.totalPending)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Awaiting client payment</span>
            </div>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overdue (Critical)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(metrics.totalOverdue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <span>Action required on WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Revenue Trends & Collection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Month Revenue Trends Visualizer */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Invoicing Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Invoiced vs Collected amounts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span className="text-slate-600 dark:text-slate-400">Invoiced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Collected</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4 pt-2">
            {trendData.length > 0 ? (
              trendData.map((item, idx) => {
                const maxVal = Math.max(
                  ...trendData.map((t) => Math.max(t.invoiced, t.collected)),
                  50000
                );
                const invoicedPct = Math.min(100, Math.round((item.invoiced / maxVal) * 100));
                const collectedPct = Math.min(100, Math.round((item.collected / maxVal) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.month}</span>
                      <div className="flex gap-3 text-slate-500 dark:text-slate-400">
                        <span>Inv: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(item.invoiced)}</strong></span>
                        <span>Rec: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(item.collected)}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {/* Invoiced Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(invoicedPct, 4)}%` }}
                        />
                      </div>
                      {/* Collected Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(collectedPct, item.collected > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                No revenue history available yet. Create your first invoice to view trends!
              </div>
            )}
          </div>
        </div>

        {/* Quick WhatsApp Automation Box */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-tight">WhatsApp Engine Status</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Direct deep-link <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded font-mono">wa.me</code> reminders include your UPI ID and payment links for zero fee instant settlements.
            </p>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Active Business UPI:</span>
                <span className="font-mono text-emerald-400 font-bold">{profile?.upiId || 'speedytrans@okaxis'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Auto Escalation Tiers:</span>
                <span className="text-indigo-300 font-medium">4 Tiers Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL Cloud Database Connected
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table with Direct WhatsApp Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track latest billings & 1-click WhatsApp alerts</p>
          </div>
          <button
            onClick={onViewAllInvoices}
            id="dashboard-view-all-invoices"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>View All Invoices</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client / Party</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => {
                  const isOverdue = inv.status === 'overdue';
                  const isPaid = inv.status === 'paid';
                  const isPartial = inv.status === 'partial';
                  const rawTotal = parseFloat(inv.totalAmount) || 0;
                  const itemsSubtotal = Array.isArray(inv.items)
                    ? inv.items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0))), 0)
                    : 0;
                  const totalAmount = rawTotal > 0 ? rawTotal : itemsSubtotal;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{inv.client?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{inv.client?.companyName || inv.client?.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {inv.dueDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isOverdue
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : isPartial
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSendReminder(inv)}
                            id={`btn-remind-${inv.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => onOpenInvoice(inv)}
                            id={`btn-view-${inv.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No invoices created yet. Click "Create Invoice" to start!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
