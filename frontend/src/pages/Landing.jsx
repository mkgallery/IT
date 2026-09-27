import React from "react";
import { Link } from "react-router-dom";
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

const features = [
  {
    icon: Ticket,
    title: "Structured tickets",
    desc: "Every issue becomes a ticket with a status — no more lost emails or chat messages.",
  },
  {
    icon: Paperclip,
    title: "Attach screenshots",
    desc: "Employees can attach images or videos so IT sees the problem, not just a description.",
  },
  {
    icon: Users,
    title: "Role-based access",
    desc: "Separate dashboards for employees, IT staff, and admins — enforced server-side.",
  },
  {
    icon: Zap,
    title: "Smart assignment",
    desc: "Assign tickets with workload warnings to prevent overload.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    desc: "Real-time stats and 7-day trends so admins see the whole picture.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    desc: "JWT sessions, bcrypt password hashing, and RBAC on every protected route.",
  },
];

const steps = [
  { n: "01", title: "Report", desc: "Employee submits a ticket with optional screenshot." },
  { n: "02", title: "Assign", desc: "Admin assigns it to the right IT staff member." },
  { n: "03", title: "Resolve", desc: "IT updates status and adds resolution notes." },
  { n: "04", title: "Track", desc: "Everyone sees progress in real time." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-slate-900">IT Support Desk</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition shadow-soft"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-100/60 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Multi-office IT ticketing — built for real teams
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05] max-w-3xl mx-auto"
          >
            Support that
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
              just works.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-lg text-slate-600 max-w-xl mx-auto"
          >
            A modern ticketing system that turns informal IT complaints into a
            structured, auditable workflow — across every office.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition shadow-card"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Role-based access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              File attachments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Real-time analytics
            </span>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/5 overflow-hidden bg-white">
              {/* Fake window bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 text-xs text-slate-400 font-mono">
                  itsupportsystem.app/admin
                </div>
              </div>
              {/* Fake dashboard */}
              <div className="grid grid-cols-12 min-h-[340px]">
                {/* Sidebar */}
                <div className="col-span-3 bg-slate-900 p-4 text-left">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                      <LifeBuoy className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-white text-xs font-medium">IT Support</div>
                  </div>
                  {["Dashboard", "All Tickets", "Team"].map((t, i) => (
                    <div
                      key={t}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md mb-1 ${
                        i === 0
                          ? "bg-slate-800 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="col-span-9 p-5 bg-slate-50 text-left">
                  <div className="text-sm font-semibold text-slate-800 mb-3">
                    Overview
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "Open", v: 12, c: "bg-amber-100 text-amber-700" },
                      { l: "Assigned", v: 8, c: "bg-sky-100 text-sky-700" },
                      { l: "Resolved", v: 42, c: "bg-emerald-100 text-emerald-700" },
                      { l: "Total", v: 76, c: "bg-slate-800 text-white" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="bg-white rounded-lg border border-slate-200 p-2"
                      >
                        <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${s.c}`}>
                          {s.l}
                        </div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500 mb-2">
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
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to run IT support
          </h2>
          <p className="text-slate-600 mt-3 max-w-lg mx-auto">
            Built from the ground up for multi-office teams — with roles,
            security, and analytics baked in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-200 hover:shadow-card transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              How it works
            </h2>
            <p className="text-slate-600 mt-3">
              Four steps from problem to resolution.
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
                className="relative p-6 rounded-2xl bg-white border border-slate-200"
              >
                <div className="text-3xl font-bold text-brand-200 mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-300 absolute top-1/2 -right-4 -translate-y-1/2" />
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
              Ready to modernize your IT support?
            </h2>
            <p className="text-white/70 mt-4 max-w-md mx-auto">
              Set up takes seconds. No credit card. Works across every office.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition shadow-lg"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/20 px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-600">
              © {new Date().getFullYear()} IT Support Desk
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Bell className="w-3.5 h-3.5" />
            Built for teams who move fast
          </div>
        </div>
      </footer>
    </div>
  );
}
