import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  AlertCircle,
  UserPlus,
  Loader,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import { Card } from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { useTheme } from "../context/ThemeContext.jsx";
import { cn } from "../lib/utils";

const pieColors = {
  Open: "#f59e0b",
  Assigned: "#0ea5e9",
  "In Progress": "#6366f1",
  Resolved: "#10b981",
  Closed: "#64748b",
};

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#0f172a";
  const legendColor = isDark ? "#94a3b8" : "#64748b";

  async function load() {
    try {
      const [statsRes, trendRes] = await Promise.all([
        api.get("/tickets/stats/overview"),
        api.get("/tickets/stats/trend"),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data);
    } catch (err) {
      toast.error(t("analytics.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chart data — names stay English (used as keys for colors)
  const pieData = stats
    ? [
        { name: "Open", label: t("admin.statOpen"), value: stats.open },
        { name: "Assigned", label: t("admin.statAssigned"), value: stats.assigned },
        { name: "In Progress", label: t("admin.statInProgress"), value: stats.inProgress },
        { name: "Resolved", label: t("admin.statResolved"), value: stats.resolved },
        { name: "Closed", label: t("admin.statClosed"), value: stats.closed },
      ].filter((d) => d.value > 0)
    : [];

  const tooltipStyle = {
    borderRadius: "0.85rem",
    border: `1px solid ${tooltipBorder}`,
    background: tooltipBg,
    color: tooltipText,
    fontSize: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };

  return (
    <Layout title={t("analytics.title")} subtitle={t("analytics.subtitle")}>
      <div className="space-y-5 max-w-6xl">
        {loading && (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </>
        )}

        {!loading && stats && (
          <>
            {/* Top stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Stat icon={AlertCircle} label={t("admin.statOpen")} value={stats.open} tone="amber" />
              <Stat icon={UserPlus} label={t("admin.statAssigned")} value={stats.assigned} tone="sky" />
              <Stat icon={Loader} label={t("admin.statInProgress")} value={stats.inProgress} tone="brand" />
              <Stat icon={CheckCircle2} label={t("admin.statResolved")} value={stats.resolved} tone="emerald" />
              <Stat icon={Inbox} label={t("admin.statClosed")} value={stats.closed} tone="slate" />
              <Stat icon={TrendingUp} label={t("admin.statTotal")} value={stats.total} tone="dark" />
            </div>

            {/* Line chart */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {t("analytics.trendTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t("analytics.trendSubtitle")}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={trend}
                      margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                    >
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="url(#lineGrad)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#6366f1" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Card>

            {/* Grid of two charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Donut */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {t("analytics.breakdownTitle")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("analytics.breakdownSubtitle")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="label"
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={pieColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px", color: legendColor }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                      {t("common.noTickets")}
                    </div>
                  )}
                </div>
              </Card>

              {/* Bar chart */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {t("analytics.countsTitle")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("analytics.countsSubtitle")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={pieData}
                        margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridColor}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          stroke={axisColor}
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke={axisColor}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={pieColors[entry.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                      {t("common.noTickets")}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

const toneClasses = {
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
  sky: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20",
  brand: "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-500/20",
  emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  dark: "bg-slate-900 text-white border-slate-900",
};

function Stat({ icon: Icon, label, value, tone = "slate" }) {
  const isDark = tone === "dark";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-4 shadow-soft",
        isDark
          ? toneClasses.dark
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center mb-2 border",
          isDark ? "bg-white/10 border-white/20" : toneClasses[tone]
        )}
      >
        <Icon className={cn("w-4 h-4", isDark && "text-white")} />
      </div>
      <div
        className={cn(
          "text-2xl font-bold",
          isDark ? "text-white" : "text-slate-900 dark:text-white"
        )}
      >
        {value ?? "—"}
      </div>
      <div
        className={cn(
          "text-[11px] font-medium uppercase tracking-wide mt-0.5",
          isDark ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
        )}
      >
        {label}
      </div>
    </motion.div>
  );
}