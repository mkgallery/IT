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
      toast.error("Could not load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.put(`/tickets/${id}/status`, { status });
      toast.success("Status updated");
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update status");
    }
  }

  async function saveNotes(id) {
    setSavingId(id);
    try {
      await api.put(`/tickets/${id}/status`, {
        resolutionNotes: notesDraft[id] || "",
      });
      toast.success("Notes saved");
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save notes");
    } finally {
      setSavingId(null);
    }
  }

  // Client-side search filter
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
        t.category?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  return (
    <Layout
      title="Assigned to Me"
      subtitle="Tickets assigned to you — update status and add resolution notes"
      searchable
      onSearch={setSearch}
      searchPlaceholder="Search assigned tickets…"
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
            title="All clear"
            description="No tickets are assigned to you right now. Nice work!"
          />
        )}

        {!loading && search && tickets.length > 0 && (
          <p className="text-xs text-slate-500">
            Showing {filteredTickets.length} of {tickets.length} ticket
            {tickets.length !== 1 ? "s" : ""} matching "
            <span className="font-medium text-slate-700">{search}</span>"
          </p>
        )}

        {!loading && filteredTickets.length === 0 && tickets.length > 0 && (
          <EmptyState
            icon={Inbox}
            title="No matches"
            description="Try a different search term."
          />
        )}

        {!loading &&
          filteredTickets.map((t, i) => (
            <motion.div
              key={t.id}
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
                          #{String(t.id).padStart(4, "0")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">
                        {t.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {t.description}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  {/* Attachment */}
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
                            className="rounded-xl max-h-64 object-cover border border-slate-200 hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <video
                          src={t.attachmentUrl}
                          controls
                          className="rounded-xl max-h-64 border border-slate-200"
                        />
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                    {t.category && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">
                        {t.category}
                      </span>
                    )}
                    <span className="capitalize">Priority: {t.priority}</span>
                    {t.reporter && (
                      <span className="flex items-center gap-1.5">
                        <Avatar name={t.reporter.name} size="sm" />
                        <span className="font-medium text-slate-700">
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
                  </div>

                  {/* Status buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Update status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(t.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                            t.status === s
                              ? "bg-brand-600 text-white border-brand-600 shadow-soft"
                              : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution notes */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">
                      <MessageSquare className="w-3 h-3" />
                      Resolution notes
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder="Add resolution notes…"
                        defaultValue={t.resolutionNotes || ""}
                        onChange={(e) =>
                          setNotesDraft({ ...notesDraft, [t.id]: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                      />
                      <Button
                        onClick={() => saveNotes(t.id)}
                        loading={savingId === t.id}
                        variant="secondary"
                      >
                        {savingId === t.id ? "Saving…" : "Save"}
                        {savingId !== t.id && <Save className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
		 <Comments ticketId={t.id} />
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </Layout>
  );
}