"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";

import { isStaffUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import { brandAssets, websiteUseImages } from "@/content/media";
import { useTheme } from "@/site/lib/themeStore";

const DEMO_EMAIL = "admin@obom.org";
const DEMO_PASSWORD = "Admin2025!";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabaseEnabled = isSupabaseConfigured();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!supabaseEnabled) {
        if (!isDemoContentEnabled()) {
          setError("Admin login requires Supabase. Configure auth env vars for production.");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          localStorage.setItem("obom_admin_auth", "true");
          onLogin();
        } else {
          setError("Invalid email or password. Add Supabase env vars for real auth.");
        }
        return;
      }

      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!isStaffUser(data.user)) {
        await supabase.auth.signOut();
        setError("This account does not have admin access. Ask a super-admin for an invitation.");
        return;
      }

      onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#1a2a1f" }}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl flex items-center justify-center bg-card/90 text-primary backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <div className="absolute inset-0 opacity-25">
        <Image src={websiteUseImages.hero} alt="" fill sizes="100vw" className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a1f]/90 via-[#1a2a1f]/70 to-[#474747]/80" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-card/95 backdrop-blur-sm rounded-3xl p-10 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative h-24 w-full mx-auto mb-4"
          >
            <Image
              src={brandAssets.logoVertical}
              alt="One By One Ministries"
              fill
              sizes="240px"
              className="object-contain"
              priority
            />
          </motion.div>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Admin Portal</p>
          <h1 className="text-xl text-foreground">Welcome Back</h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
            style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
          >
            <AlertCircle size={15} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@onebyone.org"
              required
              className="w-full px-4 py-3 rounded-xl border border-muted bg-input-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-muted bg-input-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors mt-2"
            style={{ backgroundColor: "#6E9277" }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Lock size={15} /> Sign In to Admin
              </>
            )}
          </motion.button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-5">
          {supabaseEnabled
            ? "Sign in with your Supabase admin account."
            : isDemoContentEnabled()
              ? `Development demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`
              : "Supabase auth is required in production."}
        </p>
      </motion.div>
    </div>
  );
}
