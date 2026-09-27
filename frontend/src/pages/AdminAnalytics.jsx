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
import api from "../api";
import Layout from "../components/Layout";
import { Card } from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { cn } from "../lib/utils";

const pieColors = {
  Open: "#f59e0b",
  Assigned: "#0ea5e9",
  "In Progress": "#6366f1",
  Resolved: "#10b981",
  Closed: "#64748b",
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [statsRes, trendRes] = await Promise.all([
        api.get("/tickets/stats/overview"),
        api.get("/tickets/stats/trend"),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data);
    } catch (err) {
      toast.error("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pieData = stats
    ? [
        { name: "Open", value: stats.open },
        { name: "Assigned", value: stats.assigned },
        { name: "In Progress", value: stats.inProgress },
        { name: "Resolved", value: stats.resolved },
        { name: "Closed", value: stats.closed },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Layout
      title="Analytics"
      subtitle="Live insights into your support operations"
    >
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
              <Stat icon={AlertCircle} label="Open" value={stats.open} tone="amber" />
              <Stat icon={UserPlus} label="Assigned" value={stats.assigned} tone="sky" />
              <Stat icon={Loader} label="In Progress" value={stats.inProgress} tone="brand" />
              <Stat icon={CheckCircle2} label="Resolved" value={stats.resolved} tone="emerald" />
              <Stat icon={Inbox} label="Closed" value={stats.closed} tone="slate" />
              <Stat icon={TrendingUp} label="Total" value={stats.total} tone="dark" />
            </div>

            {/* Line chart — full width */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Ticket volume — last 7 days
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Number of tickets created per day
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-600" />
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
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "0.85rem",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      />
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
                    No data yet
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
                      <h3 className="font-semibold text-slate-900">
                        Status breakdown
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current distribution
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-brand-600" />
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
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={pieColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "0.85rem",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                      No tickets yet
                    </div>
                  )}
                </div>
              </Card>

              {/* Bar chart */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Status counts
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        At a glance
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
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
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "0.85rem",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={pieColors[entry.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                      No tickets yet
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
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  sky: "bg-sky-50 text-sky-600 border-sky-100",
  brand: "bg-brand-50 text-brand-600 border-brand-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
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
        isDark ? toneClasses.dark : "bg-white border-slate-200"
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
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value ?? "—"}
      </div>
      <div
        className={cn(
          "text-[11px] font-medium uppercase tracking-wide mt-0.5",
          isDark ? "text-slate-400" : "text-slate-500"
        )}
      >
        {label}
      </div>
    </motion.div>
  );
}
