import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw,
  Send,
  Phone
} from 'lucide-react';
import { ReminderLog } from '../lib/types.ts';

interface RemindersLogViewProps {
  logs: ReminderLog[];
  onRefresh: () => void;
}

export const RemindersLogView: React.FC<RemindersLogViewProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.recipientPhone.includes(searchTerm);

    const matchesTemplate = templateFilter === 'all' || l.templateType === templateFilter;
    return matchesSearch && matchesTemplate;
  });

  const getTemplateBadge = (tier: string) => {
    switch (tier) {
      case 'polite':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'standard':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'urgent':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight">
            WhatsApp Reminder Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
            Log of dispatched WhatsApp payment alerts, templates & client responses
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200"
        >
          <RotateCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, invoice #, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['all', 'polite', 'standard', 'urgent', 'overdue'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTemplateFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                templateFilter === t
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Dispatched Time</th>
                <th className="py-3.5 px-4">Recipient & Client</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Escalation Tier</th>
                <th className="py-3.5 px-4">Channel / Status</th>
                <th className="py-3.5 px-4">Message Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.clientName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {log.recipientPhone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {log.invoiceNumber || 'INV-001'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTemplateBadge(
                          log.templateType
                        )}`}
                      >
                        {log.templateType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        WhatsApp wa.me
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 font-mono text-[11px]">
                      {log.messageContent}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No WhatsApp reminder logs found. Dispatch reminders from the Invoices tab!
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
