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
import api from "../api";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { Input, Textarea, Select } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

export default function EmployeeDashboard() {
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
      toast.error("Could not load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Only images or videos are allowed");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20 MB");
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
      toast.success("Ticket submitted successfully");

      setForm({ title: "", description: "", category: "", priority: "medium" });
      clearFile();
      await loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not submit ticket");
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Client-side search filter (only applies to the tickets list)
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
      title="My Tickets"
      subtitle="Report IT issues and track their progress"
      searchable
      onSearch={setSearch}
      searchPlaceholder="Search my tickets…"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form column */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">
                    Report a problem
                  </h2>
                  <p className="text-xs text-slate-500">
                    We'll get back to you quickly
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <Input
                  label="Title"
                  required
                  placeholder="Short summary of the issue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <Textarea
                  label="Description"
                  required
                  placeholder="Describe what's happening in detail…"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <Input
                  label="Category"
                  placeholder="e.g. Hardware, Network, Account"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />

                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>

                {/* File upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Attach image or video (optional)
                  </label>

                  <AnimatePresence>
                    {!filePreview ? (
                      <motion.label
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer transition"
                      >
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          Click to choose a file
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
                        className="relative rounded-xl overflow-hidden border border-slate-200"
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
                    ? "Uploading…"
                    : submitting
                    ? "Submitting…"
                    : "Submit ticket"}
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
              title="No tickets yet"
              description="Your reported issues will show up here once you submit them."
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
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>

                    {t.attachmentUrl && (
                      <div className="mt-4">
                        {t.attachmentType === "image" ? (
                          <a
                            href={t.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={t.attachmentUrl}
                              alt="attachment"
                              className="rounded-xl max-h-56 object-cover border border-slate-200 hover:opacity-90 transition"
                            />
                          </a>
                        ) : (
                          <video
                            src={t.attachmentUrl}
                            controls
                            className="rounded-xl max-h-56 border border-slate-200"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      {t.category && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100">
                          {t.category}
                        </span>
                      )}
                      <span className="capitalize">Priority: {t.priority}</span>
                      {t.assignee && (
                        <span className="flex items-center gap-1.5">
                          <Avatar name={t.assignee.name} size="sm" />
                          {t.assignee.name}
                        </span>
                      )}
                    </div>

                    {t.resolutionNotes && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-[11px] font-semibold text-emerald-700 mb-0.5">
                          RESOLUTION
                        </div>
                        <p className="text-sm text-emerald-800">
                          {t.resolutionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </Layout>
  );
}