import React, { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);

  async function loadAll() {
    const [tRes, sRes, statsRes] = await Promise.all([
      api.get("/tickets", { params: statusFilter ? { status: statusFilter } : {} }),
      api.get("/users", { params: { role: "it_staff" } }),
      api.get("/tickets/stats/overview"),
    ]);
    setTickets(tRes.data);
    setStaff(sRes.data);
    setStats(statsRes.data);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function assign(ticketId, assigneeId) {
    if (!assigneeId) return;
    await api.put(`/tickets/${ticketId}/assign`, { assigneeId: Number(assigneeId) });
    await loadAll();
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Admin — All Tickets" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <Stat label="Open" value={stats.open} />
            <Stat label="Assigned" value={stats.assigned} />
            <Stat label="In progress" value={stats.inProgress} />
            <Stat label="Resolved" value={stats.resolved} />
            <Stat label="Closed" value={stats.closed} />
            <Stat label="Total" value={stats.total} highlight />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["", "open", "assigned", "in_progress", "resolved", "closed"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  statusFilter === s
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s === "" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddStaff((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {showAddStaff ? "Close" : "+ Add IT staff"}
          </button>
        </div>

        {showAddStaff && (
          <AddStaffForm
            onCreated={() => {
              setShowAddStaff(false);
              loadAll();
            }}
          />
        )}

        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{t.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>

              {/* Attachment: image or video from the employee */}
              {t.attachmentUrl && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Attachment from reporter:</p>
                  {t.attachmentType === "image" ? (
                    <a href={t.attachmentUrl} target="_blank" rel="noreferrer">
                      <img
                        src={t.attachmentUrl}
                        alt="attachment"
                        className="rounded-lg max-h-60 object-cover border border-slate-200"
                      />
                    </a>
                  ) : (
                    <video
                      src={t.attachmentUrl}
                      controls
                      className="rounded-lg max-h-60 border border-slate-200"
                    />
                  )}
                </div>
              )}

              <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                <span>Priority: {t.priority}</span>
                {t.reporter && (
                  <span>
                    Reported by: {t.reporter.name} ({t.reporter.office || "—"})
                  </span>
                )}
                {t.assignee && <span>Assigned to: {t.assignee.name}</span>}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500">Assign to:</span>
                <select
                  defaultValue={t.assigneeId || ""}
                  onChange={(e) => assign(t.id, e.target.value)}
                  className="text-sm rounded-lg border border-slate-300 px-2 py-1"
                >
                  <option value="">Select IT staff…</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.office ? `(${s.office})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-slate-500 text-sm">No tickets match this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        highlight ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <div className="text-lg font-semibold">{value ?? "—"}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

function AddStaffForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "it_staff",
    office: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create account");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-5 grid sm:grid-cols-2 gap-3"
    >
      <input
        required
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        required
        type="password"
        placeholder="Temporary password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="it_staff">IT staff</option>
        <option value="admin">Admin / boss</option>
      </select>
      <input
        placeholder="Office / branch"
        value={form.office}
        onChange={(e) => setForm({ ...form, office: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
      />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button className="sm:col-span-2 bg-slate-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-900">
        Create account
      </button>
    </form>
  );
}
