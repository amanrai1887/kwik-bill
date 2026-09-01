import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface AIChatFABProps {
  onClick: () => void;
  isOpen: boolean;
  isPro: boolean;
}

export const AIChatFAB: React.FC<AIChatFABProps> = ({ onClick, isOpen, isPro }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip badge */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white text-xs font-medium rounded-full shadow-lg border border-slate-700/50 animate-bounce">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ask KwikBill AI</span>
        <kbd className="ml-1 px-1.5 py-0.5 bg-slate-800 dark:bg-slate-700 text-[10px] rounded border border-slate-600">⌘K</kbd>
      </div>

      {/* Main Trigger Button */}
      <button
        onClick={onClick}
        aria-label="Open KwikBill AI Assistant"
        className="relative group p-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md group-hover:bg-indigo-500/50 transition-colors animate-pulse" />

        <div className="relative flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
        </div>

        {/* Pro tag */}
        {isPro && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-wider uppercase rounded-full shadow border border-white dark:border-slate-900">
            PRO
          </span>
        )}
      </button>
    </div>
  );
};
