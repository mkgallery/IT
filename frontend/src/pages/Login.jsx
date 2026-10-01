import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LifeBuoy, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success(`${t("login.welcomeBack")}, ${loggedInUser.name.split(" ")[0]}!`);

      const role = loggedInUser.role;
      const target =
        role === "admin" || role === "super_admin"
          ? "/admin"
          : role === "it_staff"
          ? "/it"
          : "/employee";
      navigate(target);
    } catch (err) {
      toast.error(err.response?.data?.error || t("login.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: gradient brand panel (hidden on mobile) */}
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
              {t("landing.title1")}
              <br />
              {t("landing.title2")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/70 text-sm leading-relaxed"
            >
              {t("landing.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center gap-3 text-white/80 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              {t("landing.badge")}
            </motion.div>
          </div>

          <div className="text-white/50 text-xs">
            © {new Date().getFullYear()} IT Support Desk
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 relative flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
        {/* Language switcher (top-right corner) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              IT Support Desk
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("login.welcome")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8">
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label={t("login.email")}
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-[42px] pointer-events-none" />
              <Input
                label={t("login.password")}
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {t("login.signIn")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
            {t("login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t("login.createOne")}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}