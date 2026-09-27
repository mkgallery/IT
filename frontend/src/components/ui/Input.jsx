import React from "react";
import { cn } from "../../lib/utils";

const base =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500";

export function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input className={cn(base, error && "border-red-400 focus:border-red-500 focus:ring-red-500/10", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ className, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(base, "resize-y min-h-[100px]", error && "border-red-400", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ className, label, error, children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select className={cn(base, "pr-8 appearance-none bg-no-repeat", error && "border-red-400", className)} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
