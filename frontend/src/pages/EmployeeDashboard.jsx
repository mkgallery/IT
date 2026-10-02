import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  X,
  Ticket as TicketIcon,
  Send,
  Paperclip,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { Input, Textarea, Select } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import Comments from "../components/Comments";

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadTickets() {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      toast.error(t("employee.submitFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error(t("employee.fileTypeWrong"));
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error(t("employee.fileTooBig"));
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let attachmentUrl = null;
      let attachmentType = null;

      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await api.post("/tickets/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        attachmentUrl = uploadRes.data.url;
        attachmentType = uploadRes.data.type;
        setUploading(false);
      }

      await api.post("/tickets", { ...form, attachmentUrl, attachmentType });
      toast.success(t("employee.submitSuccess"));

      setForm({ title: "", description: "", category: "", priority: "medium" });
      clearFile();
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || t("employee.submitFailed"));
      setUploading(false);
    } finally {
      setSubmitting(false);
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
        t.category?.toLowerCase().includes(q) ||
        t.assignee?.name?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  return (
    <Layout
      title={t("employee.title")}
      subtitle={t("employee.subtitle")}
      searchable
      onSearch={setSearch}
      searchPlaceholder={t("employee.searchPlaceholder")}
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form column */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {t("employee.reportProblem")}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("employee.reportSubtitle")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <Input
                  label={t("employee.titleLabel")}
                  required
                  placeholder={t("employee.titlePlaceholder")}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <Textarea
                  label={t("employee.description")}
                  required
                  placeholder={t("employee.descriptionPlaceholder")}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <Input
                  label={t("employee.categoryLabel")}
                  placeholder={t("employee.categoryPlaceholder")}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />

                <Select
                  label={t("employee.priorityLabel")}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="low">{t("employee.priority_low")}</option>
                  <option value="medium">{t("employee.priority_medium")}</option>
                  <option value="high">{t("employee.priority_high")}</option>
                  <option value="urgent">{t("employee.priority_urgent")}</option>
                </Select>

                {/* File upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("employee.attachLabel")}
                  </label>

                  <AnimatePresence>
                    {!filePreview ? (
                      <motion.label
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/10 cursor-pointer transition"
                      >
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {t("employee.attachHint")}
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </motion.label>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                      >
                        {file?.type.startsWith("image/") ? (
                          <img
                            src={filePreview}
                            alt="preview"
                            className="w-full max-h-44 object-cover"
                          />
                        ) : (
                          <video
                            src={filePreview}
                            controls
                            className="w-full max-h-44"
                          />
                        )}
                        <button
                          type="button"
                          onClick={clearFile}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  loading={uploading || submitting}
                  className="w-full"
                  size="lg"
                >
                  {uploading
                    ? t("employee.uploading")
                    : submitting
                    ? t("employee.submitting")
                    : t("employee.submitTicket")}
                  {!uploading && !submitting && <Send className="w-4 h-4" />}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Tickets column */}
        <div className="lg:col-span-3 space-y-3">
          {loading && (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          )}

          {!loading && tickets.length === 0 && (
            <EmptyState
              icon={Inbox}
              title={t("employee.noTicketsYet")}
              description={t("employee.noTicketsDesc")}
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
                      <StatusBadge status={ticket.status} />
                    </div>

                    {ticket.attachmentUrl && (
                      <div className="mt-4">
                        {ticket.attachmentType === "image" ? (
                          <a
                            href={ticket.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={ticket.attachmentUrl}
                              alt="attachment"
                              className="rounded-xl max-h-56 object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition"
                            />
                          </a>
                        ) : (
                          <video
                            src={ticket.attachmentUrl}
                            controls
                            className="rounded-xl max-h-56 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                      {ticket.category && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {ticket.category}
                        </span>
                      )}
                      <span className="capitalize">
                        {t("common.priority")}: {ticket.priority}
                      </span>
                      {ticket.assignee && (
                        <span className="flex items-center gap-1.5">
                          <Avatar name={ticket.assignee.name} size="sm" />
                          {ticket.assignee.name}
                        </span>
                      )}
                    </div>

                    {ticket.resolutionNotes && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                        <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
                          {t("employee.resolution")}
                        </div>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                          {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}

                    <Comments ticketId={ticket.id} />
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </Layout>
  );
}