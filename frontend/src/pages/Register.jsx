import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../api";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    office: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created! You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: gradient brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div className="text-white font-semibold">IT Support Desk</div>
          </div>

          <div className="max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-white leading-tight"
            >
              Join your
              <br />
              support portal.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/70 text-sm leading-relaxed"
            >
              Create an account to report IT issues, attach screenshots, and
              track the status of your requests in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center gap-3 text-white/80 text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              Secure. Encrypted. Role-based access.
            </motion.div>
          </div>

          <div className="text-white/50 text-xs">
            © {new Date().getFullYear()} IT Support Desk
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-slate-900">IT Support Desk</div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">
            Start reporting and tracking IT issues
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label="Full name"
                required
                placeholder="Miliki Amosi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label="Email"
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label="Password"
                type="password"
                required
                placeholder="Min. 8 chars with letter, number & symbol"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label="Office / Location / Department"
                required
                placeholder="e.g. Headquarters, IT Dept"
                value={form.office}
                onChange={(e) => setForm({ ...form, office: e.target.value })}
                className="pl-10"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create account
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}