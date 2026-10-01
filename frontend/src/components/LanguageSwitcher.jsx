import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ variant = "light" }) {
  const { i18n } = useTranslation();

  function toggleLanguage() {
    const next = i18n.language === "en" ? "sw" : "en";
    i18n.changeLanguage(next);
  }

  // variant controls color so it works on light or dark backgrounds
  const styles =
    variant === "dark"
      ? "bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20"
      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <button
      onClick={toggleLanguage}
      title="Change language"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-soft ${styles}`}
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase">{i18n.language}</span>
    </button>
  );
}