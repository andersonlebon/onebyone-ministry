"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { brandAssets } from "@/content/media";
import { useI18n, LANG_LABELS, Language } from "../../../lib/i18n";
import { useTheme } from "../../../lib/themeStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setLangOpen(false); }, [pathname]);

  const transparent = isHome && !scrolled;
  const isDark = theme === "dark";

  const navLinks = [
    { to: "/about",    label: t("nav.about") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/photos",   label: t("nav.photos") },
    { to: "/videos",   label: t("nav.videos") },
    { to: "/stories",  label: t("nav.stories") },
    { to: "/contact",  label: t("nav.contact") },
  ];

  const solidBg = isDark ? "#1a2620" : "#ffffff";
  const textColor = transparent ? "rgba(255,255,255,0.88)" : isDark ? "#EDE7DA" : "#474747";
  const activeColor = transparent ? "#ffffff" : "#6E9277";
  const borderStyle = transparent ? "transparent" : isDark ? "#2a3a2e" : "#f0ebe4";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: transparent ? "transparent" : solidBg,
        boxShadow: transparent ? "none" : "0 1px 24px rgba(0,0,0,0.08)",
        borderBottom: `1px solid ${borderStyle}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-18 lg:h-22" style={{ height: "4.5rem" }}>

        {/* ── Logo ── */}
        <Link href="/" className="flex-shrink-0">
          <motion.img
            key={transparent ? "white" : "dark"}
            src={transparent || isDark ? brandAssets.logoWhite : brandAssets.logoDark}
            alt="One By One Ministries"
            className="w-auto object-contain"
            style={{ height: "clamp(34px, 4.2vw, 44px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                href={link.to}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${isActive ? "font-semibold" : ""}`}
                style={{ color: isActive ? activeColor : textColor }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right controls ── */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              backgroundColor: transparent ? "rgba(255,255,255,0.12)" : isDark ? "#2a3a2e" : "#EFE7DB",
              color: transparent ? "#ffffff" : isDark ? "#7aaa88" : "#6E9277",
            }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={isDark ? "moon" : "sun"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Language switcher */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: transparent ? "rgba(255,255,255,0.12)" : isDark ? "#2a3a2e" : "#EFE7DB",
                color: transparent ? "#ffffff" : isDark ? "#EDE7DA" : "#474747",
              }}
            >
              <span>{LANG_LABELS[language].flag}</span>
              <span className="text-xs font-bold uppercase">{language}</span>
              <ChevronDown size={11} />
            </motion.button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-50 min-w-[150px]"
                  style={{ backgroundColor: isDark ? "#22302a" : "#ffffff", border: "1px solid rgba(110,146,119,0.2)" }}
                >
                  {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setLangOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors"
                      style={{
                        backgroundColor: language === lang ? "#6E9277" + "18" : "transparent",
                        color: language === lang ? "#6E9277" : isDark ? "#EDE7DA" : "#474747",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6E9277" + "10")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = language === lang ? "#6E9277" + "18" : "transparent")}
                    >
                      <span>{LANG_LABELS[lang].flag}</span>
                      <span className="font-medium">{LANG_LABELS[lang].label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Donate CTA */}
          <Link href="/donate">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: transparent ? "rgba(255,255,255,0.3)" : "#5a7d64" }}
              whileTap={{ scale: 0.97 }}
              className="px-5 h-9 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: transparent ? "rgba(255,255,255,0.18)" : "#6E9277",
                border: transparent ? "1.5px solid rgba(255,255,255,0.6)" : "none",
              }}
            >
              {t("nav.donate")}
            </motion.button>
          </Link>
        </div>

        {/* ── Mobile controls ── */}
        <div className="lg:hidden flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: transparent ? "#ffffff" : isDark ? "#7aaa88" : "#474747" }}>
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
          </motion.button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg" style={{ color: transparent ? "#ffffff" : isDark ? "#EDE7DA" : "#474747" }} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t"
            style={{
              backgroundColor: isDark ? "#1a2620" : "#ffffff",
              borderColor: isDark ? "#2a3a2e" : "#f0ebe4",
            }}
          >
            <div className="px-5 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <Link key={link.to} href={link.to}
                    className={`block py-3 px-3 text-base rounded-xl transition-colors ${isActive ? "font-semibold" : ""}`}
                    style={{
                      backgroundColor: isActive ? "#6E9277" + "18" : "transparent",
                      color: isActive ? "#6E9277" : isDark ? "#EDE7DA" : "#474747",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/donate" className="block mt-3 mx-0">
                <button className="w-full py-3 rounded-xl text-base font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
                  {t("nav.donate")}
                </button>
              </Link>

              {/* Language switcher mobile */}
              <div className="pt-3 border-t flex gap-2" style={{ borderColor: isDark ? "#2a3a2e" : "#f0ebe4" }}>
                {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    style={{
                      backgroundColor: language === lang ? "#6E9277" : isDark ? "#2a3a2e" : "#EFE7DB",
                      color: language === lang ? "#ffffff" : isDark ? "#EDE7DA" : "#474747",
                    }}>
                    {LANG_LABELS[lang].flag} {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
