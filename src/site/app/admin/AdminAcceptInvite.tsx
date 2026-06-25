"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Sun, Moon } from "lucide-react";

import { isStaffUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTheme } from "@/site/lib/themeStore";

export default function AdminAcceptInvite() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    async function loadSession() {
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Invitation link expired or invalid. Ask a super-admin to resend your invite.");
        setLoading(false);
        return;
      }

      if (!isStaffUser(user)) {
        await supabase.auth.signOut();
        setError("This invitation is not for an admin account.");
        setLoading(false);
        return;
      }

      const existingName = user.user_metadata?.name;
      if (typeof existingName === "string" && existingName.trim()) {
        setName(existingName.trim());
      }

      setReady(true);
      setLoading(false);
    }

    void loadSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { name: name.trim() || undefined },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-muted text-primary"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl p-8 w-full max-w-md shadow-xl border border-muted"
      >
        <div className="text-center mb-6">
          <CheckCircle2 size={28} className="mx-auto mb-3 text-primary" />
          <h1 className="text-xl text-foreground">Accept Admin Invitation</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Set your name and password to finish joining the One By One Ministries admin portal.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm bg-red-50 text-red-700 border border-red-200">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-muted bg-input-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border border-muted bg-input-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-muted bg-input-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground text-sm flex items-center justify-center gap-2 disabled:opacity-60 bg-primary"
            >
              <Lock size={15} />
              {submitting ? "Saving..." : "Activate Admin Account"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
