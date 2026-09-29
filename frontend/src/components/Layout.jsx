import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./ui/Avatar";
import { cn } from "../lib/utils";

const roleLabels = {
  employee: "Employee",
  it_staff: "IT Staff",
  admin: "Administrator",
  super_admin: "Super Admin",
};

const roleHome = {
  employee: "/employee",
  it_staff: "/it",
  admin: "/admin",
  super_admin: "/admin",
};

export default function Layout({
  title,
  subtitle,
  children,
  actions,
  searchable = false,
  onSearch,
  searchPlaceholder = "Search tickets…",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const navItems = [
    {
      to: roleHome[user?.role] || "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
      end: true,
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      show: isAdmin,
      end: true,
    },
    {
      to: "/admin/team",
      label: "Team",
      icon: Users,
      show: isAdmin,
      end: true,
    },
  ].filter((i) => i.show);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  }

  const SidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <LifeBuoy className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-white font-semibold text-sm">IT Support</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Desk
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-slate-800/70 text-white shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-brand-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User card */}
      {user && (
        <div className="p-3 border-t border-slate-800/60">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {roleLabels[user.role] || user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 flex flex-col bg-slate-900 z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-5 lg:px-8 py-4 flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg text-slate-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>

            {searchable && (
              <div className="relative hidden md:block w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                />
              </div>
            )}

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}