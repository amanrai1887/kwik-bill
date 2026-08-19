import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  CreditCard, 
  Trash2, 
  Printer, 
  FileText,
  IndianRupee,
  Share2,
  CheckSquare,
  Square,
  Download,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../lib/types.ts';
import { triggerPaymentCelebration } from '../utils/confetti.ts';

interface InvoicesViewProps {
  invoices: Invoice[];
  onCreateInvoice: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: number) => void;
  onBulkSendReminders?: (invoices: Invoice[]) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onCreateInvoice,
  onOpenInvoice,
  onSendReminder,
  onRecordPayment,
  onDeleteInvoice,
  onBulkSendReminders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Deep multi-field fuzzy search
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return statusFilter === 'all' || inv.status === statusFilter;

    const matchesInvoiceNo = (inv.invoiceNumber || '').toLowerCase().includes(q);
    const matchesClientName = (inv.client?.name || '').toLowerCase().includes(q);
    const matchesCompanyName = (inv.client?.companyName || inv.client?.businessName || '').toLowerCase().includes(q);
    const matchesPhone = (inv.client?.phone || '').includes(q);
    const matchesVehicle = (inv.industryDetails?.vehicleNo || '').toLowerCase().includes(q);
    const matchesLr = (inv.industryDetails?.lrNumber || '').toLowerCase().includes(q);
    const matchesAmount = (inv.totalAmount || '').toString().includes(q);
    const matchesNotes = (inv.notes || '').toLowerCase().includes(q);
    const matchesItems = (inv.items || []).some((it: any) => 
      (it.description || '').toLowerCase().includes(q) ||
      (it.hsnCode || '').toString().includes(q)
    );

    const matchesSearch =
      matchesInvoiceNo ||
      matchesClientName ||
      matchesCompanyName ||
      matchesPhone ||
      matchesVehicle ||
      matchesLr ||
      matchesAmount ||
      matchesNotes ||
      matchesItems;

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'overdue':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'partial':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  // Multi-select helpers
  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every(inv => selectedIds.includes(inv.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(inv => inv.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Bulk Export to CSV
  const handleBulkExportCsv = () => {
    const selectedInvoices = invoices.filter(inv => selectedIds.includes(inv.id));
    if (selectedInvoices.length === 0) return;

    const headers = ['Invoice Number', 'Client Name', 'Phone', 'Issue Date', 'Due Date', 'Total Amount', 'Paid Amount', 'Status'];
    const rows = selectedInvoices.map(inv => [
      inv.invoiceNumber,
      `"${inv.client?.name || 'Customer'}"`,
      inv.client?.phone || '',
      inv.issueDate || '',
      inv.dueDate || '',
      inv.totalAmount || 0,
      inv.paidAmount || 0,
      inv.status || 'pending',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KwikBill_Invoices_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk WhatsApp Trigger
  const handleBulkReminders = () => {
    const selectedInvoices = invoices.filter(inv => selectedIds.includes(inv.id) && inv.status !== 'paid');
    if (selectedInvoices.length === 0) {
      alert('None of the selected invoices have pending dues.');
      return;
    }

    if (onBulkSendReminders) {
      onBulkSendReminders(selectedInvoices);
    } else {
      // Trigger individual whatsapp queues
      selectedInvoices.forEach(inv => onSendReminder(inv));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Invoices & Billing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, dispatch WhatsApp payment reminders, and record collections
          </p>
        </div>

        <button
          onClick={onCreateInvoice}
          id="invoices-create-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
          <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-700/80 text-indigo-100">
            N
          </kbd>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center transition-colors">
        {/* Deep Fuzzy Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="invoices-search-input"
            placeholder="Search invoice #, client, phone, vehicle, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['all', 'pending', 'overdue', 'partial', 'paid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bulk Action Ribbon when items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-3.5 px-5 rounded-2xl shadow-lg border border-indigo-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-800 text-xs font-mono font-bold">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-indigo-200">
              Bulk actions across selected invoices:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkReminders}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Queue WhatsApp Reminders</span>
            </button>

            <button
              onClick={handleBulkExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Issue & Due Date</th>
                <th className="py-3.5 px-4">Amount & Status</th>
                <th className="py-3.5 px-4">Reminders</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const balanceDue = Math.max(0, (parseFloat(inv.totalAmount) || 0) - (parseFloat(inv.paidAmount) || 0));
                  const isSelected = selectedIds.includes(inv.id);

                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleSelectOne(inv.id)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Invoice No */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</div>
                        {inv.industryDetails?.vehicleNo && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            🚛 {inv.industryDetails.vehicleNo} {inv.industryDetails.lrNumber ? `• LR: ${inv.industryDetails.lrNumber}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{inv.client?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {inv.client?.companyName ? `${inv.client.companyName} • ` : ''}
                          {inv.client?.phone}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-300 font-medium">Due: {inv.dueDate}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Issued: {inv.issueDate}</div>
                      </td>

                      {/* Amount & Status */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                          {formatCurrency(inv.totalAmount)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                              inv.status
                            )}`}
                          >
                            {inv.status}
                          </span>
                          {inv.status !== 'paid' && balanceDue > 0 && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              (Due: {formatCurrency(balanceDue)})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reminders count */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] border border-emerald-200 dark:border-emerald-800">
                            {inv.reminderSentCount || 0}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">sent</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Reminder */}
                          <button
                            onClick={() => onSendReminder(inv)}
                            id={`inv-btn-whatsapp-${inv.id}`}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Record Payment */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                onRecordPayment(inv);
                              }}
                              id={`inv-btn-pay-${inv.id}`}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                              title="Record Settlement"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* View/Print */}
                          <button
                            onClick={() => onOpenInvoice(inv)}
                            id={`inv-btn-view-${inv.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="View Invoice & UPI QR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            id={`inv-btn-delete-${inv.id}`}
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No invoices match your current search or filter criteria.
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

