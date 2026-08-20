import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';
import { AnalyticsData, Invoice, UserProfile } from '../lib/types.ts';
import { getPlanLimits } from '../lib/planConfig.ts';

interface MonthlyReportsViewProps {
  analytics: AnalyticsData | null;
  invoices: Invoice[];
  profile?: UserProfile | null;
  onUpgrade?: () => void;
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({ analytics, invoices, profile, onUpgrade }) => {
  const planLimits = getPlanLimits(profile || null);
  const isPro = planLimits.canExportGstr1Reports;
  const trendData = analytics?.trendData || [];
  const metrics = analytics?.metrics || {
    totalInvoiced: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    totalInvoicesCount: 0,
  };

  // Compute GST and TDS totals across active non-cancelled invoices
  const activeInvoices = invoices.filter((inv) => inv.status !== 'cancelled' && !inv.isCancelled);
  const totalTaxAmount = activeInvoices.reduce((sum, inv) => sum + (parseFloat(inv.taxAmount) || 0), 0);
  const totalTdsAmount = activeInvoices.reduce((sum, inv) => sum + (parseFloat(inv.tdsAmount) || 0), 0);
  const totalSubtotal = activeInvoices.reduce((sum, inv) => sum + (parseFloat(inv.subtotal) || 0), 0);

  const formatCurrency = (num: number) => {
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Client Name', 'Issue Date', 'Due Date', 'Status', 'Subtotal', 'Tax Amount', 'TDS Amount', 'Total Amount', 'Paid Amount'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.client?.name || 'Customer'}"`,
      inv.issueDate,
      inv.dueDate,
      inv.status,
      inv.subtotal,
      inv.taxAmount,
      inv.tdsAmount,
      inv.totalAmount,
      inv.paidAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KwikBill_Monthly_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGstr1Json = () => {
    if (!isPro) {
      alert('GSTR-1 JSON Portal-Ready export is a Pro Plan feature. Upgrade to Pro (₹499/mo) to download automated government portal filings.');
      if (onUpgrade) onUpgrade();
      return;
    }

    const b2bInvoices = invoices.map(inv => ({
      ctin: inv.client?.gstin || 'URP',
      cname: inv.client?.name || 'Customer',
      inum: inv.invoiceNumber,
      idt: inv.issueDate,
      val: parseFloat(inv.totalAmount || '0'),
      pos: '27',
      rchrg: 'N',
      inv_typ: 'R',
      itms: (inv.items || []).map((itm: any, idx: number) => ({
        num: idx + 1,
        itm_det: {
          rt: parseFloat(inv.taxRate || '18'),
          txval: parseFloat(itm.amount || '0'),
          iamt: 0,
          camt: (parseFloat(itm.amount || '0') * 0.09).toFixed(2),
          samt: (parseFloat(itm.amount || '0') * 0.09).toFixed(2),
          csamt: 0
        }
      }))
    }));

    const gstr1Payload = {
      gstin: "27AAAAA0000A1Z5",
      fp: `${new Date().getMonth() + 1}${new Date().getFullYear()}`,
      b2b: b2bInvoices,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gstr1Payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GSTR1_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight">
            Monthly Reports & Tax Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
            GST reconciliation, collection efficiency, TDS deductions & GSTR-1 portal exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportGstr1Json}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition hover:scale-[1.02] cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>GSTR-1 JSON (GST Portal Ready)</span>
            {!isPro && (
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 rounded uppercase">
                PRO
              </span>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            id="export-csv-report-btn"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Export CA Excel / CSV</span>
          </button>
        </div>
      </div>


      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Invoiced */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Billings</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight mt-2 font-mono">
            {formatCurrency(metrics.totalInvoiced)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Net Subtotal: {formatCurrency(totalSubtotal)}
          </div>
        </div>

        {/* GST Output Tax */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total GST Liability</span>
          <div className="text-2xl font-extrabold text-indigo-600 tracking-tight mt-2 font-mono">
            {formatCurrency(totalTaxAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Output tax on invoices
          </div>
        </div>

        {/* TDS Deducted */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">TDS Deducted (Sec 194J)</span>
          <div className="text-2xl font-extrabold text-amber-600 tracking-tight mt-2 font-mono">
            {formatCurrency(totalTdsAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Claimable via Form 26AS
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collection Efficiency</span>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-2 font-mono">
            {metrics.collectionRate}%
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">
            {formatCurrency(metrics.totalCollected)} collected
          </div>
        </div>
      </div>

      {/* Month-By-Month Financial Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Revenue & Collection Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Summary table by billing cycle</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            FY 2025 - 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Billing Month</th>
                <th className="py-3.5 px-4 text-right">Invoiced Amount</th>
                <th className="py-3.5 px-4 text-right">Settled Amount</th>
                <th className="py-3.5 px-4 text-right">Pending / Overdue</th>
                <th className="py-3.5 px-4 text-center">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 font-mono">
              {trendData.length > 0 ? (
                trendData.map((item, idx) => {
                  const rate = item.invoiced > 0 ? Math.min(100, Math.round((item.collected / item.invoiced) * 100)) : 100;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                        {item.month}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.invoiced)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                        {formatCurrency(item.collected)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-600">
                        {formatCurrency(item.pending)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            rate >= 80
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : rate >= 50
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-sans">
                    No monthly data recorded yet.
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
