import React, { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./ui/Avatar";
import { cn } from "../lib/utils";

export default function Comments({ ticketId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${ticketId}/comments`);
      setComments(res.data);
    } catch (err) {
      toast.error(t("comments.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/tickets/${ticketId}/comments`, { body });
      setComments([...comments, res.data]);
      setBody("");
      toast.success(t("comments.posted"));
    } catch (err) {
      toast.error(err.response?.data?.error || t("comments.postFailed"));
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/tickets/${ticketId}/comments/${id}`);
      setComments(comments.filter((c) => c.id !== id));
      toast.success(t("comments.deleted"));
    } catch (err) {
      toast.error(err.response?.data?.error || t("comments.deleteFailed"));
    }
  }

  const canDelete = (c) => {
    if (!user) return false;
    if (c.userId === user.id) return true;
    return user.role === "admin" || user.role === "super_admin";
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:text-brand-600 dark:hover:text-brand-400 transition"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {t("comments.title")}
        {comments.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
            {comments.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                  {t("comments.loading")}
                </div>
              )}

              {!loading && comments.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  {t("comments.empty")}
                </p>
              )}

              {!loading &&
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 group">
                    <Avatar name={c.author?.name || "?"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {c.author?.name || t("comments.unknownAuthor")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap break-words">
                        {c.body}
                      </p>
                    </div>
                    {canDelete(c) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete comment"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

              {/* Add comment */}
              <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
                <input
                  placeholder={t("comments.placeholder")}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={posting || !body.trim()}
                  className={cn(
                    "px-3 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-medium",
                    posting || !body.trim()
                      ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                      : "bg-brand-600 hover:bg-brand-700"
                  )}
                >
                  {posting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {t("comments.post")}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}