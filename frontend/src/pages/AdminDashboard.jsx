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
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTicket, setDeleteTicket] = useState(null);

  const filters = [
    { value: "", label: t("admin.filterAll") },
    { value: "open", label: t("admin.statOpen") },
    { value: "assigned", label: t("admin.statAssigned") },
    { value: "in_progress", label: t("admin.statInProgress") },
    { value: "resolved", label: t("admin.statResolved") },
    { value: "closed", label: t("admin.statClosed") },
  ];

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
      toast.error(t("admin.loadFailed"));
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
      toast.success(t("admin.assignedSuccess"));
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || t("admin.assignFailed"));
    }
  }

  async function confirmDelete() {
    if (!deleteTicket) return;
    try {
      await api.delete(`/tickets/${deleteTicket.id}`);
      toast.success("Ticket deleted");
      setDeleteTicket(null);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  }

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter((ticket) => {
      const id = String(ticket.id).padStart(4, "0");
      return (
        ticket.title?.toLowerCase().includes(q) ||
        ticket.description?.toLowerCase().includes(q) ||
        id.includes(q) ||
        ticket.reporter?.name?.toLowerCase().includes(q) ||
        ticket.reporter?.office?.toLowerCase().includes(q) ||
        ticket.assignee?.name?.toLowerCase().includes(q) ||
        ticket.category?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  return (
    <Layout
      title={t("admin.title")}
      subtitle={t("admin.subtitle")}
      searchable
      onSearch={setSearch}
      searchPlaceholder={t("admin.searchPlaceholder")}
    >
      <div className="space-y-6">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat icon={AlertCircle} label={t("admin.statOpen")} value={stats.open} tone="amber" />
            <Stat icon={UserPlus} label={t("admin.statAssigned")} value={stats.assigned} tone="sky" />
            <Stat icon={Loader} label={t("admin.statInProgress")} value={stats.inProgress} tone="brand" />
            <Stat icon={CheckCircle2} label={t("admin.statResolved")} value={stats.resolved} tone="emerald" />
            <Stat icon={Inbox} label={t("admin.statClosed")} value={stats.closed} tone="slate" />
            <Stat icon={TrendingUp} label={t("admin.statTotal")} value={stats.total} tone="dark" />
          </div>
        )}

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
                <X className="w-4 h-4" /> {t("common.close")}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> {t("admin.addITStaff")}
              </>
            )}
          </Button>
        </div>

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

        {search && !loading && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("employee.showing", {
              count: filteredTickets.length,
              total: tickets.length,
            })}{" "}
            "<span className="font-medium text-slate-700 dark:text-slate-200">{search}</span>"
          </p>
        )}

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
              title={search ? t("common.noMatches") : t("common.noTickets")}
              description={
                search
                  ? "Try a different search term."
                  : "No tickets match this filter right now."
              }
            />
          )}

          {!loading &&
            filteredTickets.map((ticket, i) => {
              const atts =
                Array.isArray(ticket.attachments) && ticket.attachments.length > 0
                  ? ticket.attachments
                  : ticket.attachmentUrl
                  ? [{ url: ticket.attachmentUrl, type: ticket.attachmentType }]
                  : [];

              return (
                <motion.div
                  key={ticket.id}
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
                              #{String(ticket.id).padStart(4, "0")}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ticket.status} />
                          <button
                            onClick={() => setDeleteTicket(ticket)}
                            title="Delete ticket"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {atts.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                            {t("admin.attachmentFromReporter")} ({atts.length})
                          </p>
                          <div
                            className={`grid gap-2 ${
                              atts.length === 1
                                ? "grid-cols-1"
                                : atts.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-3"
                            }`}
                          >
                            {atts.map((a, idx) =>
                              a.type === "image" ? (
                                <a
                                  key={idx}
                                  href={a.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={a.url}
                                    alt={`attachment ${idx + 1}`}
                                    className={`rounded-lg object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition w-full ${
                                      atts.length === 1 ? "max-h-64" : "aspect-square"
                                    }`}
                                  />
                                </a>
                              ) : (
                                <video
                                  key={idx}
                                  src={a.url}
                                  controls
                                  className={`rounded-lg border border-slate-200 dark:border-slate-700 w-full ${
                                    atts.length === 1 ? "max-h-64" : "aspect-square"
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize">
                          {t("common.priority")}: {ticket.priority}
                        </span>
                        {ticket.reporter && (
                          <span className="flex items-center gap-1.5">
                            <Avatar name={ticket.reporter.name} size="sm" />
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {ticket.reporter.name}
                            </span>
                            {ticket.reporter.office && (
                              <span className="flex items-center gap-1 text-slate-400">
                                · <Building2 className="w-3 h-3" />
                                {ticket.reporter.office}
                              </span>
                            )}
                          </span>
                        )}
                        {ticket.assignee && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-slate-400">→</span>
                            <Avatar name={ticket.assignee.name} size="sm" />
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {ticket.assignee.name}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t("admin.assignTo")}
                        </span>
                        <select
                          defaultValue={ticket.assigneeId || ""}
                          onChange={(e) => assign(ticket.id, e.target.value)}
                          className="text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition min-w-[200px]"
                        >
                          <option value="">{t("admin.selectStaff")}</option>
                          {staff.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.office ? `(${s.office})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Comments ticketId={ticket.id} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>

      <AnimatePresence>
        {deleteTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTicket(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Delete ticket?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      #{String(deleteTicket.id).padStart(4, "0")} — {deleteTicket.title}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  This will permanently delete the ticket
                  {deleteTicket.attachmentUrl ||
                  (deleteTicket.attachments && deleteTicket.attachments.length)
                    ? " and all its attached files"
                    : ""}
                  .
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTicket(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmDelete}
                    className="flex-1"
                  >
                    Yes, delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

function AddStaffForm({ onCreated }) {
  const { t } = useTranslation();
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
      toast.success(t("addMember.success"));
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || t("addMember.failed"));
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
              {t("addMember.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("addMember.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            required
            label={t("addMember.fullName")}
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            required
            type="email"
            label={t("addMember.email")}
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            required
            type="password"
            label={t("addMember.password")}
            placeholder={t("addMember.passwordHint")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label={t("addMember.role")}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="it_staff">{t("roles.it_staff")}</option>
            <option value="admin">{t("roles.admin")}</option>
          </Select>
          <div className="sm:col-span-2">
            <Input
              required
              label={t("addMember.office")}
              placeholder={t("addMember.officeHint")}
              value={form.office}
              onChange={(e) => setForm({ ...form, office: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? t("addMember.creating") : t("addMember.createAccount")}
        </Button>
      </form>
    </Card>
  );
}
