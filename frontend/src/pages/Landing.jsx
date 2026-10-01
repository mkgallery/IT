import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LifeBuoy,
  ArrowRight,
  Ticket,
  Bell,
  Users,
  ShieldCheck,
  BarChart3,
  Paperclip,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Ticket, key: "tickets" },
    { icon: Paperclip, key: "screenshots" },
    { icon: Users, key: "roles" },
    { icon: Zap, key: "assignment" },
    { icon: BarChart3, key: "analytics" },
    { icon: ShieldCheck, key: "secure" },
  ];

  const steps = [
    { n: "01", key: "report" },
    { n: "02", key: "assign" },
    { n: "03", key: "resolve" },
    { n: "04", key: "track" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              IT Support Desk
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2"
            >
              {t("landing.signIn")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition shadow-soft"
            >
              {t("landing.getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-100/60 dark:bg-brand-500/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("landing.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] max-w-3xl mx-auto"
          >
            {t("landing.title1")}
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t("landing.title2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto"
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-card"
            >
              {t("landing.startFree")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {t("landing.signIn")}
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t("landing.trust1")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t("landing.trust2")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t("landing.trust3")}
            </span>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/5 overflow-hidden bg-white dark:bg-slate-900">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 text-xs text-slate-400 font-mono">
                  itsupportsystem.app/admin
                </div>
              </div>
              <div className="grid grid-cols-12 min-h-[340px]">
                <div className="col-span-3 bg-slate-900 p-4 text-left">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                      <LifeBuoy className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-white text-xs font-medium">IT Support</div>
                  </div>
                  {["Dashboard", "All Tickets", "Team"].map((label, i) => (
                    <div
                      key={label}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md mb-1 ${
                        i === 0 ? "bg-slate-800 text-white" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="col-span-9 p-5 bg-slate-50 dark:bg-slate-950 text-left">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Overview
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "Open", v: 12, c: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
                      { l: "Assigned", v: 8, c: "bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400" },
                      { l: "Resolved", v: 42, c: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
                      { l: "Total", v: 76, c: "bg-slate-800 text-white" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-2"
                      >
                        <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${s.c}`}>
                          {s.l}
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      7-day trend
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[30, 45, 38, 60, 52, 72, 68].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("landing.featuresTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-lg mx-auto">
            {t("landing.featuresSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-500/30 hover:shadow-card transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {t(`landing.features.${f.key}.title`)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t(`landing.features.${f.key}.desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("landing.howTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3">
              {t("landing.howSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <div className="text-3xl font-bold text-brand-200 dark:text-brand-500/40 mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {t(`landing.steps.${s.key}.title`)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                  {t(`landing.steps.${s.key}.desc`)}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-300 dark:text-slate-700 absolute top-1/2 -right-4 -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 px-8 py-16 text-center">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t("landing.ctaTitle")}
            </h2>
            <p className="text-white/70 mt-4 max-w-md mx-auto">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition shadow-lg"
              >
                {t("landing.ctaButton")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/20 px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition"
              >
                {t("landing.signIn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} IT Support Desk
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Bell className="w-3.5 h-3.5" />
            {t("landing.footer")}
          </div>
        </div>
      </footer>
    </div>
  );
}