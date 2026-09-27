import React from "react";
import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-soft",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-sm rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
