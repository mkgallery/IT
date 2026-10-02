import React, { useEffect, useState, useMemo } from "react";
import {
  Ticket as TicketIcon,
  Building2,
  Save,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import Comments from "../components/Comments";

const statusOptions = ["assigned", "in_progress", "resolved", "closed"];

export default function ITDashboard() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  async function loadTickets() {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      toast.error(t("it.statusUpdateFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.put(`/tickets/${id}/status`, { status });
      toast.success(t("it.statusUpdated"));
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || t("it.statusUpdateFailed"));
    }
  }

  async function saveNotes(id) {
    setSavingId(id);
    try {
      await api.put(`/tickets/${id}/status`, {
        resolutionNotes: notesDraft[id] || "",
      });
      toast.success(t("it.notesSaved"));
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || t("it.notesSaveFailed"));
    } finally {
      setSavingId(null);
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
        ticket.category?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  return (
    <Layout
      title={t("it.title")}
      subtitle={t("it.subtitle")}
      searchable
      onSearch={setSearch}
      searchPlaceholder={t("it.searchPlaceholder")}
    >
      <div className="space-y-4 max-w-4xl">
        {loading && (
          <>
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </>
        )}

        {!loading && tickets.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={t("it.allClear")}
            description={t("it.allClearDesc")}
          />
        )}

        {!loading && search && tickets.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("employee.showing", {
              count: filteredTickets.length,
              total: tickets.length,
            })}{" "}
            "<span className="font-medium text-slate-700 dark:text-slate-200">{search}</span>"
          </p>
        )}

        {!loading && filteredTickets.length === 0 && tickets.length > 0 && (
          <EmptyState
            icon={Inbox}
            title={t("common.noMatches")}
            description="Try a different search term."
          />
        )}

        {!loading &&
          filteredTickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="hover:shadow-card transition-shadow">
                <div className="p-5">
                  {/* Header */}
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
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  {/* Attachment */}
                  {ticket.attachmentUrl && (
                    <div className="mt-4">
                      <p className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                        {t("it.attachmentFromReporter")}
                      </p>
                      {ticket.attachmentType === "image" ? (
                        <a
                          href={ticket.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={ticket.attachmentUrl}
                            alt="attachment"
                            className="rounded-xl max-h-64 object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <video
                          src={ticket.attachmentUrl}
                          controls
                          className="rounded-xl max-h-64 border border-slate-200 dark:border-slate-700"
                        />
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                    {ticket.category && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        {ticket.category}
                      </span>
                    )}
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
                  </div>

                  {/* Status buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      {t("it.updateStatus")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(ticket.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                            ticket.status === s
                              ? "bg-brand-600 text-white border-brand-600 shadow-soft"
                              : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution notes */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <MessageSquare className="w-3 h-3" />
                      {t("it.resolutionNotes")}
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder={t("it.addNotes")}
                        defaultValue={ticket.resolutionNotes || ""}
                        onChange={(e) =>
                          setNotesDraft({ ...notesDraft, [ticket.id]: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                      />
                      <Button
                        onClick={() => saveNotes(ticket.id)}
                        loading={savingId === ticket.id}
                        variant="secondary"
                      >
                        {savingId === ticket.id ? t("common.saving") : t("common.save")}
                        {savingId !== ticket.id && <Save className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Comments ticketId={ticket.id} />
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </Layout>
  );
}