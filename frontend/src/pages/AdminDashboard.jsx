import React, { useEffect, useState, useMemo } from "react";
import {
  Ticket as TicketIcon,
  Building2,
  UserPlus,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader,
  Inbox,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../api";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import Comments from "../components/Comments";
import { cn } from "../lib/utils";

const filters = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadAll() {
    try {
      const [tRes, sRes, statsRes] = await Promise.all([
        api.get("/tickets", {
          params: statusFilter ? { status: statusFilter } : {},
        }),
        api.get("/users", { params: { role: "it_staff" } }),
        api.get("/tickets/stats/overview"),
      ]);
      setTickets(tRes.data);
      setStaff(sRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function assign(ticketId, assigneeId) {
    if (!assigneeId) return;
    try {
      await api.put(`/tickets/${ticketId}/assign`, {
        assigneeId: Number(assigneeId),
      });
      toast.success("Ticket assigned");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not assign");
    }
  }

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      const id = String(t.id).padStart(4, "0");
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        id.includes(q) ||
        t.reporter?.name?.toLowerCase().includes(q) ||
        t.reporter?.office?.toLowerCase().includes(q) ||
        t.assignee?.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  return (
    <Layout
      title="Admin — All Tickets"
      subtitle="Monitor, assign, and resolve tickets across all offices"
      searchable
      onSearch={setSearch}
      searchPlaceholder="Search by title, reporter, ID…"
    >
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat icon={AlertCircle} label="Open" value={stats.open} tone="amber" />
            <Stat
              icon={UserPlus}
              label="Assigned"
              value={stats.assigned}
              tone="sky"
            />
            <Stat
              icon={Loader}
              label="In Progress"
              value={stats.inProgress}
              tone="brand"
            />
            <Stat
              icon={CheckCircle2}
              label="Resolved"
              value={stats.resolved}
              tone="emerald"
            />
            <Stat icon={Inbox} label="Closed" value={stats.closed} tone="slate" />
            <Stat
              icon={TrendingUp}
              label="Total"
              value={stats.total}
              tone="dark"
            />
          </div>
        )}

        {/* Filter + Add staff */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border font-medium transition",
                  statusFilter === f.value
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button
            variant={showAddStaff ? "outline" : "primary"}
            onClick={() => setShowAddStaff((v) => !v)}
          >
            {showAddStaff ? (
              <>
                <X className="w-4 h-4" /> Close
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Add IT Staff
              </>
            )}
          </Button>
        </div>

        {/* Add staff form */}
        <AnimatePresence>
          {showAddStaff && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AddStaffForm
                onCreated={() => {
                  setShowAddStaff(false);
                  loadAll();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search hint */}
        {search && !loading && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredTickets.length} of {tickets.length} ticket
            {tickets.length !== 1 ? "s" : ""} matching "
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {search}
            </span>
            "
          </p>
        )}

        {/* Tickets */}
        <div className="space-y-3">
          {loading && (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          )}

          {!loading && filteredTickets.length === 0 && (
            <EmptyState
              icon={Inbox}
              title={search ? "No matches" : "No tickets"}
              description={
                search
                  ? "Try a different search term."
                  : "No tickets match this filter right now."
              }
            />
          )}

          {!loading &&
            filteredTickets.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-card transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TicketIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-mono">
                            #{String(t.id).padStart(4, "0")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>

                    {t.attachmentUrl && (
                      <div className="mt-4">
                        <p className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                          Attachment from reporter
                        </p>
                        {t.attachmentType === "image" ? (
                          <a
                            href={t.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={t.attachmentUrl}
                              alt="attachment"
                              className="rounded-xl max-h-64 object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition"
                            />
                          </a>
                        ) : (
                          <video
                            src={t.attachmentUrl}
                            controls
                            className="rounded-xl max-h-64 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize">
                        Priority: {t.priority}
                      </span>
                      {t.reporter && (
                        <span className="flex items-center gap-1.5">
                          <Avatar name={t.reporter.name} size="sm" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {t.reporter.name}
                          </span>
                          {t.reporter.office && (
                            <span className="flex items-center gap-1 text-slate-400">
                              · <Building2 className="w-3 h-3" />
                              {t.reporter.office}
                            </span>
                          )}
                        </span>
                      )}
                      {t.assignee && (
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400">→</span>
                          <Avatar name={t.assignee.name} size="sm" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {t.assignee.name}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Assign to:
                      </span>
                      <select
                        defaultValue={t.assigneeId || ""}
                        onChange={(e) => assign(t.id, e.target.value)}
                        className="text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition min-w-[200px]"
                      >
                        <option value="">Select IT staff…</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.office ? `(${s.office})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Comments ticketId={t.id} />
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </Layout>
  );
}

/* ---------- Stat card ---------- */
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

/* ---------- Add staff form ---------- */
function AddStaffForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "it_staff",
    office: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users", form);
      toast.success("Account created");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Create new account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              IT staff or another admin
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            required
            label="Full name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            required
            type="email"
            label="Email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            required
            type="password"
            label="Temporary password"
            placeholder="Min. 8 chars"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="it_staff">IT Staff</option>
            <option value="admin">Admin / Boss</option>
          </Select>
          <div className="sm:col-span-2">
            <Input
              required
              label="Office / Location / Department"
              placeholder="e.g. Headquarters, IT Dept"
              value={form.office}
              onChange={(e) => setForm({ ...form, office: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}