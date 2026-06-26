"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Rocket,
  Shield,
} from "lucide-react";

import { getSetupStatusAction, runProjectSetupAction, type SetupStatus } from "@/app/actions/setup";
import { SETUP_SUPER_ADMIN_EMAIL } from "@/lib/setup/constants";
import { brandAssets, websiteUseImages } from "@/content/media";

const STEPS = [
  "Create super-admin account in Supabase Auth",
  "Seed site settings, posts, projects, and videos",
  "Register gallery and media records in the database",
  "Lock this setup page (one-time only)",
];

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSetupStatusAction().then((s) => {
      setStatus(s);
      setLoadingStatus(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await runProjectSetupAction({
        email: SETUP_SUPER_ADMIN_EMAIL,
        password,
        name,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(result.message);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              complete: true,
              canRun: false,
              superAdminEmail: SETUP_SUPER_ADMIN_EMAIL,
            }
          : prev
      );

      setTimeout(() => router.push("/admin/login"), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  const configItems = [
    { label: "Supabase URL + publishable key", ok: status?.configured.supabase },
    { label: "DATABASE_URL", ok: status?.configured.database },
    { label: "SUPABASE_SERVICE_ROLE_KEY", ok: status?.configured.serviceRole },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4"
      style={{ backgroundColor: "#1a2a1f" }}
    >
      <div className="absolute inset-0 opacity-25">
        <Image src={websiteUseImages.hero} alt="" fill sizes="100vw" className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a1f]/92 via-[#1a2a1f]/80 to-[#474747]/85" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="relative h-20 w-full mx-auto mb-4">
              <Image
                src={brandAssets.logoVertical}
                alt="One By One Ministries"
                fill
                sizes="240px"
                className="object-contain"
                priority
              />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#7a7068] mb-1">One-time launch</p>
            <h1 className="text-2xl text-[#474747] font-medium">Project Setup</h1>
            <p className="text-sm text-[#7a7068] mt-2 leading-relaxed">
              Creates the super-admin account, seeds default content, and prepares the database. This runs once.
            </p>
          </div>

          {loadingStatus ? (
            <div className="flex justify-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full"
              />
            </div>
          ) : status?.complete ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#6E9277]/15 text-[#6E9277]">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-[#474747] font-medium">Setup already completed</p>
              <p className="text-sm text-[#7a7068]">
                Super-admin: <span className="font-medium">{status.superAdminEmail}</span>
                {status.completedAt && (
                  <>
                    <br />
                    Completed {new Date(status.completedAt).toLocaleString()}
                  </>
                )}
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: "#6E9277" }}
              >
                Go to admin login
              </Link>
              <p className="text-xs text-[#7a7068] mt-4 leading-relaxed">
                To run setup again, reset the database first:{" "}
                <code className="text-[10px] bg-[#FAF7F2] px-1 py-0.5 rounded">npm run db:reset:all</code>
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-[#e3d9ce] bg-[#FAF7F2] p-4 mb-6 space-y-2">
                <p className="text-xs font-semibold text-[#474747] flex items-center gap-1.5">
                  <Database size={13} style={{ color: "#6E9277" }} />
                  Environment checklist
                </p>
                {configItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-[#7a7068]">
                    {item.ok ? (
                      <CheckCircle2 size={14} className="text-[#6E9277] flex-shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                    )}
                    {item.label}
                  </div>
                ))}
              </div>

              <ul className="space-y-2 mb-6">
                {STEPS.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-xs text-[#7a7068]">
                    <Rocket size={13} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>

              {status?.databaseError && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
                  style={{ backgroundColor: "#fffbeb", color: "#b45309" }}
                >
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Database connection issue: {status?.databaseError}. Check{" "}
                    <code className="text-[10px]">DATABASE_URL</code> in{" "}
                    <code className="text-[10px]">.env.local</code> (use the Transaction pooler host from Supabase
                    Dashboard, often <code className="text-[10px]">aws-1-…</code> not{" "}
                    <code className="text-[10px]">aws-0-…</code>), then restart the dev server.
                  </span>
                </div>
              )}

              {error && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                >
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
                  style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                >
                  <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#474747] mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anderson Buyan"
                    required
                    disabled={!status?.canRun || submitting}
                    className="w-full px-4 py-3 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277] disabled:opacity-60"
                    style={{ borderColor: "rgba(110,146,119,0.3)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#474747] mb-1.5">Super-admin email</label>
                  <input
                    type="email"
                    value={SETUP_SUPER_ADMIN_EMAIL}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border text-sm text-[#7a7068] bg-[#FAF7F2] cursor-not-allowed"
                    style={{ borderColor: "rgba(110,146,119,0.3)" }}
                  />
                  <p className="text-[10px] text-[#a09890] mt-1 flex items-center gap-1">
                    <Shield size={10} />
                    Only this email can run setup
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#474747] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      disabled={!status?.canRun || submitting}
                      className="w-full px-4 py-3 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277] disabled:opacity-60"
                      style={{ borderColor: "rgba(110,146,119,0.3)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7068]"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#474747] mb-1.5">Confirm password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={8}
                    disabled={!status?.canRun || submitting}
                    className="w-full px-4 py-3 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277] disabled:opacity-60"
                    style={{ borderColor: "rgba(110,146,119,0.3)" }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={!status?.canRun || submitting}
                  whileHover={status?.canRun ? { scale: 1.02 } : undefined}
                  whileTap={status?.canRun ? { scale: 0.98 } : undefined}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#6E9277" }}
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <KeyRound size={15} />
                      Launch project
                    </>
                  )}
                </motion.button>

                {!status?.canRun && !status?.databaseError && (
                  <p className="text-xs text-center text-[#7a7068]">
                    Fix the missing environment variables in <code className="text-[10px]">.env.local</code>, then restart the dev server.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
