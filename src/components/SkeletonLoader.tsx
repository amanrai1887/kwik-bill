import React from 'react';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
    <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
    <div className="w-36 h-7 bg-slate-300 dark:bg-slate-600 rounded mb-3" />
    <div className="w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

export const SkeletonTableRow: React.FC = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800/60">
    <td className="p-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="p-4">
      <div className="w-24 h-4 bg-slate-300 dark:bg-slate-600 rounded mb-1" />
      <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
    </td>
    <td className="p-4">
      <div className="w-32 h-4 bg-slate-300 dark:bg-slate-600 rounded mb-1" />
      <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
    </td>
    <td className="p-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="p-4"><div className="w-24 h-5 bg-slate-300 dark:bg-slate-600 rounded" /></td>
    <td className="p-4"><div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
    <td className="p-4"><div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" /></td>
  </tr>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
    </div>
    <table className="w-full text-left border-collapse">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);
