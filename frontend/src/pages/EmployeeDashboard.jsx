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

const MAX_FILES = 5;
const MAX_SIZE = 20 * 1024 * 1024;

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
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
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
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const combined = [...files, ...selected];

    if (combined.length > MAX_FILES) {
      toast.error(`Max ${MAX_FILES} files per ticket`);
      return;
    }

    for (const f of selected) {
      if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
        toast.error(t("employee.fileTypeWrong"));
        return;
      }
      if (f.size > MAX_SIZE) {
        toast.error(t("employee.fileTooBig"));
        return;
      }
    }

    setFiles(combined);
    setPreviews([
      ...previews,
      ...selected.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video/") ? "video" : "image",
      })),
    ]);
    e.target.value = "";
  }

  function removeFile(index) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index].url);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  function clearFiles() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setPreviews([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let uploadedAttachments = [];

      if (files.length > 0) {
        setUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const uploadRes = await api.post("/tickets/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedAttachments = uploadRes.data.attachments || [];
        setUploading(false);
      }

      await api.post("/tickets", { ...form, attachments: uploadedAttachments });
      toast.success(t("employee.submitSuccess"));

      setForm({ title: "", description: "", category: "", priority: "medium" });
      clearFiles();
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

                {/* Multi-file upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("employee.attachLabel")}{" "}
                    <span className="text-slate-400">
                      ({files.length}/{MAX_FILES})
                    </span>
                  </label>

                  {/* Preview grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {previews.map((p, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square"
                        >
                          {p.type === "image" ? (
                            <img
                              src={p.url}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={p.url}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add more button */}
                  {files.length < MAX_FILES && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/10 cursor-pointer transition">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {files.length === 0
                          ? t("employee.attachHint")
                          : `Add more (up to ${MAX_FILES - files.length})`}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
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
            filteredTickets.map((ticket, i) => {
              // Build attachments list: prefer new array, fallback to legacy single
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

                      {/* Attachments gallery */}
                      {atts.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                            Attachments ({atts.length})
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
                                      atts.length === 1 ? "max-h-56" : "aspect-square"
                                    }`}
                                  />
                                </a>
                              ) : (
                                <video
                                  key={idx}
                                  src={a.url}
                                  controls
                                  className={`rounded-lg border border-slate-200 dark:border-slate-700 w-full ${
                                    atts.length === 1 ? "max-h-56" : "aspect-square"
                                  }`}
                                />
                              )
                            )}
                          </div>
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
              );
            })}
        </div>
      </div>
    </Layout>
  );
}