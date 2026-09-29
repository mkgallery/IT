import React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("p-5 border-b border-slate-100 dark:border-slate-800", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("p-5 border-t border-slate-100 dark:border-slate-800", className)}
      {...props}
    />
  );
}