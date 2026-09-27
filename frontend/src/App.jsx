import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import Landing from "./pages/Landing.jsx";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import ITDashboard from "./pages/ITDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminTeam from "./pages/AdminTeam.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it"
        element={
          <ProtectedRoute roles={["it_staff"]}>
            <ITDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/team"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminTeam />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={["admin"]}>
              <AdminAnalytics />
          </ProtectedRoute>
  }
/>
    </Routes>
  );
}
