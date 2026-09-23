import React, { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const statusOptions = ["assigned", "in_progress", "resolved", "closed"];

export default function ITDashboard() {
  const [tickets, setTickets] = useState([]);
  const [notesDraft, setNotesDraft] = useState({});

  async function loadTickets() {
    const res = await api.get("/tickets");
    setTickets(res.data);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function updateStatus(id, status) {
    await api.put(`/tickets/${id}/status`, { status });
    await loadTickets();
  }

  async function saveNotes(id) {
    await api.put(`/tickets/${id}/status`, { resolutionNotes: notesDraft[id] || "" });
    await loadTickets();
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Assigned to Me" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {tickets.length === 0 && (
          <p className="text-slate-500 text-sm">No tickets assigned to you yet.</p>
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
              {t.reporter && <span>Reported by: {t.reporter.name} ({t.reporter.office || "—"})</span>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 mr-1">Update status:</span>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(t.id, s)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    t.status === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                placeholder="Add resolution notes…"
                defaultValue={t.resolutionNotes || ""}
                onChange={(e) => setNotesDraft({ ...notesDraft, [t.id]: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => saveNotes(t.id)}
                className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
