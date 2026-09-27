import React from "react";
import { cn } from "../../lib/utils";

const palette = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

export default function Avatar({ name = "", size = "md", className }) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  };
  const color = palette[hash(name) % palette.length];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold shrink-0",
        sizes[size],
        color,
        className
      )}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
