import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="p-8 text-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles) {
    // Super admin is allowed wherever "admin" is required
    const effectiveRoles = [...roles];
    if (roles.includes("admin") && !effectiveRoles.includes("super_admin")) {
      effectiveRoles.push("super_admin");
    }

    if (!effectiveRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}