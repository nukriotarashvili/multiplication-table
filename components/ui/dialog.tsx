import * as React from "react";

export function Dialog({
  open,
  onOpenChange,
  children
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <div
      className={`fixed inset-0 z-[120] transition-opacity duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="dialog-overlay absolute inset-0 bg-slate-950/60"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative z-[121] grid min-h-screen place-items-center p-4 transition-transform duration-200 ${open ? "translate-y-0 scale-100" : "translate-y-1 scale-95"}`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`dialog-content w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`text-2xl font-bold text-slate-900 dark:text-slate-100 ${className}`}>{children}</h3>;
}

export function DialogDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-base text-slate-600 dark:text-slate-300 ${className}`}>{children}</p>;
}
