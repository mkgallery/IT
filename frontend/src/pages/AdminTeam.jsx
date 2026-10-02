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
import { useTranslation } from "react-i18next";
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
    key: "super_admin",
    icon: Crown,
    cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  },
  admin: {
    key: "admin",
    icon: ShieldCheck,
    cls: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  },
  it_staff: {
    key: "it_staff",
    icon: Shield,
    cls: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20",
  },
  employee: {
    key: "employee",
    icon: UserIcon,
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  },
};

export default function AdminTeam() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const isSuper = me?.role === "super_admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const roleFilters = [
    { v: "", label: t("team.filterAll") },
    { v: "super_admin", label: t("team.filterSuperAdmins") },
    { v: "admin", label: t("team.filterAdmins") },
    { v: "it_staff", label: t("team.filterITStaff") },
    { v: "employee", label: t("team.filterEmployees") },
  ];

  async function load() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error(t("team.noUsers"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title={t("team.title")}
      subtitle={t("team.subtitle")}
      actions={
        <Button
          onClick={() => setShowAdd((v) => !v)}
          variant={showAdd ? "outline" : "primary"}
        >
          {showAdd ? (
            <>
              <X className="w-4 h-4" /> {t("common.close")}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> {t("team.addMember")}
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
              placeholder={t("team.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roleFilters.map((f) => (
              <button
                key={f.v}
                onClick={() => setRoleFilter(f.v)}
                className={cn(
                  "text-xs px-3 py-2 rounded-lg border font-medium transition",
                  roleFilter === f.v
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
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
            title={t("team.noUsers")}
            description={t("team.noUsersDesc")}
          />
        )}

        {!loading && filtered.length > 0 && (
          <Card>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => {
                const rc = roleConfig[u.role] || roleConfig.employee;
                const RIcon = rc.icon;
                const isMe = u.id === me?.id;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition"
                  >
                    <Avatar name={u.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </div>
                        {isMe && (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                            {t("team.you")}
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            rc.cls
                          )}
                        >
                          <RIcon className="w-3 h-3" />
                          {t(`roles.${rc.key}`)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {u.email}
                        {u.office && <span> · {u.office}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canReset(u) && (
                        <button
                          onClick={() => setResetUser(u)}
                          title={t("team.resetPassword")}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete(u) && (
                        <button
                          onClick={() => setDeleteUser(u)}
                          title={t("team.deleteUser")}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
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
                toast.success(
                  t("team.deleteSuccess", { name: deleteUser.name })
                );
                setDeleteUser(null);
                load();
              } catch (err) {
                toast.error(err.response?.data?.error || t("team.deleteFailed"));
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
  const { t } = useTranslation();
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
      toast.success(t("addMember.success"));
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || t("addMember.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              {t("addMember.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("addMember.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            required
            label={t("addMember.fullName")}
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            required
            type="email"
            label={t("addMember.email")}
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            required
            type="password"
            label={t("addMember.password")}
            placeholder={t("addMember.passwordHint")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label={t("addMember.role")}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">{t("roles.employee")}</option>
            <option value="it_staff">{t("roles.it_staff")}</option>
            <option value="admin">{t("roles.admin")}</option>
            {isSuper && (
              <option value="super_admin">{t("roles.super_admin")}</option>
            )}
          </Select>
          <div className="sm:col-span-2">
            <Input
              required
              label={t("addMember.office")}
              placeholder={t("addMember.officeHint")}
              value={form.office}
              onChange={(e) => setForm({ ...form, office: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? t("addMember.creating") : t("addMember.createAccount")}
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Reset password modal ---------- */
function ResetPasswordModal({ user, onClose }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user.id}/password`, { password });
      toast.success(t("team.resetSuccess", { name: user.name }));
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || t("team.resetFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {t("team.resetTitle")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("team.resetSubtitle")}{" "}
              <span className="font-medium">{user.name}</span>
            </p>
          </div>
        </div>

        <Input
          required
          type="password"
          label={t("team.newPassword")}
          placeholder={t("register.passwordHint")}
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
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {loading ? t("common.saving") : t("team.resetPassword")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Delete confirmation modal ---------- */
function ConfirmDeleteModal({ user, onClose, onConfirm }) {
  const { t } = useTranslation();
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
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {t("team.deleteTitle", { name: user.name })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("team.deleteWarn")}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          {isEmployee && <>{t("team.deleteEmployeeWarn")}</>}
          {isStaff && <>{t("team.deleteStaffWarn")}</>}
          {isPrivileged && <>{t("team.deleteAdminWarn")}</>}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handle}
            loading={loading}
            className="flex-1"
          >
            {loading ? t("common.deleting") : t("team.deleteConfirm")}
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
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}