import React from "react";
import { Circle, UserCheck, Loader, CheckCircle2, Archive } from "lucide-react";
import { cn } from "../lib/utils";

const config = {
  open: {
    label: "Open",
    icon: Circle,
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  assigned: {
    label: "Assigned",
    icon: UserCheck,
    cls: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  },
  in_progress: {
    label: "In Progress",
    icon: Loader,
    cls: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    icon: Archive,
    cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.open;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
        c.cls
      )}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}