import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

function getVariantClass(variant: ButtonProps["variant"]) {
  if (variant === "outline") {
    return "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800";
  }
  if (variant === "ghost") {
    return "bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800";
  }
  return "bg-emerald-500 text-white hover:bg-emerald-400 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${getVariantClass(variant)} ${className}`}
      {...props}
    />
  );
});
