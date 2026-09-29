import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Key,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  Crown,
  User as UserIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { cn } from "../lib/utils";

const roleConfig = {
  super_admin: {
    label: "Super Admin",
    icon: Crown,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
  it_staff: {
    label: "IT Staff",
    icon: Shield,
    cls: "bg-brand-50 text-brand-700 border-brand-200",
  },
  employee: {
    label: "Employee",
    icon: UserIcon,
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function AdminTeam() {
  const { user: me } = useAuth();
  const isSuper = me?.role === "super_admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  async function load() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.office || "").toLowerCase().includes(q)
    );
  });

  // Whether the logged-in user can act on this target user
  function canReset(target) {
    if (target.id === me?.id) return true;
    const targetIsPrivileged =
      target.role === "admin" || target.role === "super_admin";
    if (targetIsPrivileged && !isSuper) return false;
    return true;
  }

  function canDelete(target) {
    if (target.id === me?.id) return false;
    const targetIsPrivileged =
      target.role === "admin" || target.role === "super_admin";
    if (targetIsPrivileged && !isSuper) return false;
    return true;
  }

  return (
    <Layout
      title="Team"
      subtitle="Manage users, reset passwords, and remove accounts"
      actions={
        <Button
          onClick={() => setShowAdd((v) => !v)}
          variant={showAdd ? "outline" : "primary"}
        >
          {showAdd ? (
            <>
              <X className="w-4 h-4" /> Close
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Add member
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AddMemberForm
                isSuper={isSuper}
                onCreated={() => {
                  setShowAdd(false);
                  load();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by name, email, or office…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "", label: "All" },
              { v: "super_admin", label: "Super Admins" },
              { v: "admin", label: "Admins" },
              { v: "it_staff", label: "IT Staff" },
              { v: "employee", label: "Employees" },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setRoleFilter(f.v)}
                className={cn(
                  "text-xs px-3 py-2 rounded-lg border font-medium transition",
                  roleFilter === f.v
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading && (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try changing your search or filter."
          />
        )}

        {!loading && filtered.length > 0 && (
          <Card>
            <div className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const rc = roleConfig[u.role] || roleConfig.employee;
                const RIcon = rc.icon;
                const isMe = u.id === me?.id;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50/70 transition"
                  >
                    <Avatar name={u.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-slate-900 truncate">
                          {u.name}
                        </div>
                        {isMe && (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                            You
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            rc.cls
                          )}
                        >
                          <RIcon className="w-3 h-3" />
                          {rc.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {u.email}
                        {u.office && <span> · {u.office}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canReset(u) && (
                        <button
                          onClick={() => setResetUser(u)}
                          title="Reset password"
                          className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete(u) && (
                        <button
                          onClick={() => setDeleteUser(u)}
                          title="Delete user"
                          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Reset password modal */}
      <AnimatePresence>
        {resetUser && (
          <ResetPasswordModal
            user={resetUser}
            onClose={() => setResetUser(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteUser && (
          <ConfirmDeleteModal
            user={deleteUser}
            onClose={() => setDeleteUser(null)}
            onConfirm={async () => {
              try {
                await api.delete(`/users/${deleteUser.id}`);
                toast.success(`${deleteUser.name} deleted`);
                setDeleteUser(null);
                load();
              } catch (err) {
                toast.error(err.response?.data?.error || "Delete failed");
              }
            }}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* ---------- Add member form ---------- */
function AddMemberForm({ onCreated, isSuper }) {
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
      toast.success("Account created");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Create new member
            </h3>
            <p className="text-xs text-slate-500">
              Add an employee, IT staff, or admin
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            required
            label="Full name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            required
            type="email"
            label="Email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            required
            type="password"
            label="Temporary password"
            placeholder="Min. 8 chars"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="it_staff">IT Staff</option>
            <option value="admin">Admin / Boss</option>
            {isSuper && <option value="super_admin">Super Admin</option>}
          </Select>
          <div className="sm:col-span-2">
            <Input
              required
              label="Office / Location / Department"
              placeholder="e.g. Headquarters, IT Dept"
              value={form.office}
              onChange={(e) => setForm({ ...form, office: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Reset password modal ---------- */
function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user.id}/password`, { password });
      toast.success(`Password reset for ${user.name}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Key className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Reset password</h3>
            <p className="text-xs text-slate-500">
              Set a new temporary password for{" "}
              <span className="font-medium">{user.name}</span>
            </p>
          </div>
        </div>

        <Input
          required
          type="password"
          label="New password"
          placeholder="Min. 8 chars with letter, number & symbol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {loading ? "Saving…" : "Reset password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Delete confirmation modal ---------- */
function ConfirmDeleteModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  const isEmployee = user.role === "employee";
  const isStaff = user.role === "it_staff";
  const isPrivileged = user.role === "admin" || user.role === "super_admin";

  return (
    <Modal onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Delete {user.name}?
            </h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
          {isEmployee && (
            <>
              All tickets reported by this employee will also be permanently
              deleted.
            </>
          )}
          {isStaff && (
            <>
              Tickets assigned to this IT staff member will be unassigned and
              set back to <b>Open</b> so you can reassign them.
            </>
          )}
          {isPrivileged && (
            <>
              This is a privileged account. Deleting it will remove admin
              access immediately.
            </>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handle}
            loading={loading}
            className="flex-1"
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Reusable modal shell ---------- */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}