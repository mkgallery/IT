import React from "react";
import { cn } from "../../lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-soft">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
