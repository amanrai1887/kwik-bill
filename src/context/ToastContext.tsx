import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default 4500
  action?: ToastAction;
}

interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => string;
  success: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => string;
  error: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => string;
  warning: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => string;
  info: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Global Event Dispatcher for non-React context calls
type ToastListener = (toast: ToastOptions) => void;
const toastListeners: Set<ToastListener> = new Set();

export const toast = {
  show: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    toastListeners.forEach((l) => l(opts));
  },
  success: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
    const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
    const toastObj: ToastOptions = { type: 'success', message, ...(opts || {}) };
    toastListeners.forEach((l) => l(toastObj));
  },
  error: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
    const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
    const toastObj: ToastOptions = { type: 'error', message, ...(opts || {}) };
    toastListeners.forEach((l) => l(toastObj));
  },
  warning: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
    const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
    const toastObj: ToastOptions = { type: 'warning', message, ...(opts || {}) };
    toastListeners.forEach((l) => l(toastObj));
  },
  info: (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
    const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
    const toastObj: ToastOptions = { type: 'info', message, ...(opts || {}) };
    toastListeners.forEach((l) => l(toastObj));
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions | string): string => {
    const opts = typeof options === 'string' ? { message: options } : options;
    const id = opts.id || Math.random().toString(36).substring(2, 9);
    const type = opts.type || 'info';
    const duration = opts.duration ?? 4500;

    const newToast: ToastItem = {
      ...opts,
      id,
      type,
      duration,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      // Keep maximum 4 toasts at a time in the top-right
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered.slice(-3), newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const success = useCallback(
    (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
      const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
      return showToast({ type: 'success', message, ...(opts || {}) });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
      const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
      return showToast({ type: 'error', message, ...(opts || {}) });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
      const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
      return showToast({ type: 'warning', message, ...(opts || {}) });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, titleOrOptions?: string | Omit<ToastOptions, 'message' | 'type'>) => {
      const opts = typeof titleOrOptions === 'string' ? { title: titleOrOptions } : titleOrOptions;
      return showToast({ type: 'info', message, ...(opts || {}) });
    },
    [showToast]
  );

  // Subscribe to global toast calls
  useEffect(() => {
    const handleGlobalToast = (opts: ToastOptions) => {
      showToast(opts);
    };
    toastListeners.add(handleGlobalToast);
    return () => {
      toastListeners.delete(handleGlobalToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismiss }}>
      {children}

      {/* Top Right Floating Toast Container */}
      <div 
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none p-2 sm:p-0"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const type = t.type || 'info';

          const getStyle = () => {
            switch (type) {
              case 'success':
                return {
                  card: 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-900/60 shadow-emerald-500/10',
                  iconBadge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
                  bar: 'bg-emerald-500',
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  defaultTitle: 'Success',
                };
              case 'error':
                return {
                  card: 'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-900/60 shadow-rose-500/10',
                  iconBadge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
                  bar: 'bg-rose-500',
                  icon: <AlertCircle className="w-5 h-5" />,
                  defaultTitle: 'Attention',
                };
              case 'warning':
                return {
                  card: 'bg-white/95 dark:bg-slate-900/95 border-amber-200 dark:border-amber-900/60 shadow-amber-500/10',
                  iconBadge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
                  bar: 'bg-amber-500',
                  icon: <AlertTriangle className="w-5 h-5" />,
                  defaultTitle: 'Notice',
                };
              case 'info':
              default:
                return {
                  card: 'bg-white/95 dark:bg-slate-900/95 border-indigo-200 dark:border-indigo-900/60 shadow-indigo-500/10',
                  iconBadge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
                  bar: 'bg-indigo-500',
                  icon: <Sparkles className="w-5 h-5" />,
                  defaultTitle: 'Update',
                };
            }
          };

          const style = getStyle();

          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative overflow-hidden backdrop-blur-md rounded-2xl p-4 shadow-2xl border transition-all duration-300 ease-out animate-in slide-in-from-top-3 sm:slide-in-from-right-5 fade-in ${style.card}`}
              role="alert"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${style.iconBadge}`}>
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t.title || style.defaultTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words font-medium">
                    {t.message}
                  </p>

                  {t.action && (
                    <button
                      onClick={() => {
                        t.action?.onClick();
                        dismiss(t.id);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{t.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${style.bar}`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
