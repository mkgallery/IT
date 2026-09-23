import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const roleLabels = {
  employee: "Employee",
  it_staff: "IT Staff",
  admin: "Boss / Admin",
};

export default function TopBar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg">{title}</h1>
          {user && (
            <p className="text-xs text-slate-500">
              {user.name} · {roleLabels[user.role]}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
