"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

import { brandAssets, websiteUseImages } from "@/content/media";

const ADMIN_EMAIL = "admin@obom.org";
const ADMIN_PASSWORD = "Admin2025!";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("obom_admin_auth", "true");
        onLogin();
      } else {
        setError("Invalid email or password. Try admin@obom.org / Admin2025!");
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#1a2a1f" }}>
      <div className="absolute inset-0 opacity-25">
        <Image
          src={websiteUseImages.hero}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a1f]/90 via-[#1a2a1f]/70 to-[#474747]/80" />

      <motion.div
        animate={{ borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"] }}
        transition={{ duration: 16, repeat: Infinity }}
        className="absolute w-80 h-80 -top-20 -left-20 opacity-10"
        style={{ backgroundColor: "#6E9277", filter: "blur(50px)" }}
      />
      <motion.div
        animate={{ borderRadius: ["30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%"] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute w-80 h-80 -bottom-20 -right-20 opacity-10"
        style={{ backgroundColor: "#EAC79A", filter: "blur(50px)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl p-10 w-full max-w-md shadow-2xl"
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
              className="object-contain"
              priority
            />
          </motion.div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#7a7068] mb-1">Admin Portal</p>
          <h1 className="text-xl text-[#474747]">Welcome Back</h1>
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
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@obom.org"
              required
              className="w-full px-4 py-3 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7068] hover:text-[#474747]"
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

        <p className="text-xs text-[#7a7068] text-center mt-5">
          Demo credentials: admin@obom.org / Admin2025!
        </p>
      </motion.div>
    </div>
  );
}
