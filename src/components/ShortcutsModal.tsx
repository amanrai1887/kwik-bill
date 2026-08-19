import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create New Tax Invoice' },
    { key: 'D', desc: 'Go to Live Workspace Dashboard' },
    { key: 'I', desc: 'Go to Tax Invoices Ledger' },
    { key: 'R', desc: 'Go to Auto-Billing Recurring Hub' },
    { key: 'C', desc: 'Go to Client Directory & Ledger' },
    { key: 'S', desc: 'Go to Settings & Branding Studio' },
    { key: '/', desc: 'Focus Quick Search Bar' },
    { key: '?', desc: 'Show this Keyboard Shortcuts cheat-sheet' },
    { key: 'Esc', desc: 'Close any open modal or preview' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Power user quick-navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 py-2">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.desc}</span>
              <kbd className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
