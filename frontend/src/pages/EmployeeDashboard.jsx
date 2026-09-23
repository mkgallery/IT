import React, { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadTickets() {
    const res = await api.get("/tickets");
    setTickets(res.data);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/tickets", form);
      setForm({ title: "", description: "", category: "", priority: "medium" });
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="My IT Support Tickets" />
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6">
            <h2 className="font-medium mb-4">Report a problem</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Short title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                required
                placeholder="Describe the issue in detail"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Category (e.g. Hardware, Network)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent</option>
              </select>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={submitting}
                className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit ticket"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          {tickets.length === 0 && (
            <p className="text-slate-500 text-sm">You haven't reported any issues yet.</p>
          )}
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{t.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                {t.category && <span>Category: {t.category}</span>}
                <span>Priority: {t.priority}</span>
                {t.assignee && <span>Assigned to: {t.assignee.name}</span>}
              </div>
              {t.resolutionNotes && (
                <p className="mt-2 text-sm bg-emerald-50 text-emerald-800 rounded-lg p-2">
                  Resolution: {t.resolutionNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
