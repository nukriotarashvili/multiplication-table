import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed right-3 top-20 z-[100] flex w-full max-w-sm flex-col gap-2 sm:right-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl border border-emerald-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-emerald-900/40 dark:bg-slate-900/95"
        >
          <div className="flex items-start gap-3">
            {toast.icon && (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                {toast.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.description}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md px-1 text-slate-500 transition-all hover:text-slate-700 active:scale-95 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Dismiss toast"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
