import { CheckCircle, AlertCircle } from 'lucide-react';
import type { ToastState } from '../hooks/useToast';

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
        toast.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{toast.message}</span>
    </div>
  );
}
