"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Deterministic first render (server + client) avoids hydration mismatches.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem("obom_theme") as Theme | null;
      if (saved === "dark" || saved === "light") initial = saved;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) initial = "dark";
    } catch {}
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem("obom_theme", theme); } catch {}
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export function useColors() {
  const { theme } = useContext(ThemeContext);
  const d = theme === "dark";
  return {
    /* Section backgrounds */
    cream:       d ? "#1a2620" : "#EFE7DB",
    white:       d ? "#22302a" : "#ffffff",
    card:        d ? "#22302a" : "#ffffff",
    /* Text */
    text:        d ? "#EDE7DA" : "#474747",
    muted:       d ? "#8fa895" : "#7a7068",
    /* Borders / dividers */
    border:      d ? "rgba(122,170,136,0.18)" : "rgba(110,146,119,0.22)",
    borderLight: d ? "#2a3a2e" : "#e3d9ce",
    divider:     d ? "#2a3a2e" : "#f5f0ea",
    /* Inputs */
    inputBg:     d ? "#2a3a2e" : "#ffffff",
    hoverBg:     d ? "#2a3a2e" : "#EFE7DB",
    /* Hero / dark sections stay dark always */
    hero:        "#0d1810",
    /* Footer */
    footer:      d ? "#0f1810" : "#474747",
    /* Brand colours – unchanged */
    green:    "#6E9277",
    gold:     "#EAC79A",
    burgundy: "#5A4749",
    isDark: d,
  } as const;
}
