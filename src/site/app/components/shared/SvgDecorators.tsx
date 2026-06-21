"use client";

import { motion } from "motion/react";

/* ─── Wave Transitions ─── */
const WAVE_HEIGHT = 72;

export function WaveBottom({ fill = "#ffffff" }: { fill?: string }) {
  return (
    <div className="leading-none -mb-px" aria-hidden="true">
      <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: WAVE_HEIGHT }}>
        <path d="M0,45 C240,90 480,0 720,45 C960,90 1200,10 1440,30 L1440,90 L0,90 Z" fill={fill} />
      </svg>
    </div>
  );
}

export function WaveTop({ fill = "#EFE7DB" }: { fill?: string }) {
  return (
    <div className="leading-none" aria-hidden="true">
      <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: WAVE_HEIGHT }}>
        <path d="M0,60 C360,10 720,90 1080,40 C1260,10 1380,55 1440,45 L1440,0 L0,0 Z" fill={fill} />
      </svg>
    </div>
  );
}

export function WaveDivider({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  return (
    <div className="leading-none relative z-10 w-full" style={{ backgroundColor: topColor }} aria-hidden="true">
      <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: WAVE_HEIGHT }}>
        <path d="M0,50 C200,100 400,0 600,50 C800,100 1000,10 1200,50 C1320,80 1400,30 1440,40 L1440,100 L0,100 Z" fill={bottomColor} />
      </svg>
    </div>
  );
}

/* ─── Dot Grid Overlay ─── */
export function DotPattern({ color = "rgba(255,255,255,0.12)", size = 20 }: { color?: string; size?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, ${color} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/* ─── Animated Blob ─── */
export function AnimatedBlob({
  color = "#6E9277",
  opacity = 0.12,
  className = "",
  size = 600,
}: {
  color?: string;
  opacity?: number;
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      animate={{
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
        rotate: [0, 20, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: color,
          opacity,
          borderRadius: "inherit",
          filter: "blur(40px)",
        }}
      />
    </motion.div>
  );
}

/* ─── Cross / Plus Pattern ─── */
export function CrossPattern({ color = "rgba(110,146,119,0.08)" }: { color?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

/* ─── Diagonal Stripes ─── */
export function DiagonalStripes({ color = "rgba(255,255,255,0.04)" }: { color?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          ${color} 0px,
          ${color} 1px,
          transparent 1px,
          transparent 30px
        )`,
      }}
    />
  );
}

/* ─── Animated Circle Ring ─── */
export function PulsingRing({
  color = "#6E9277",
  size = 300,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size + i * 60,
            height: size + i * 60,
            top: -(i * 30),
            left: -(i * 30),
            borderColor: color,
            opacity: 0.15 - i * 0.04,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.15 - i * 0.04, 0.08, 0.15 - i * 0.04] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Leaf / Organic Shape ─── */
export function LeafShape({ color = "#6E9277", opacity = 0.08, className = "" }: { color?: string; opacity?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{ rotate: [0, 8, -4, 0], scale: [1, 1.05, 0.98, 1] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 200, height: 300 }}>
        <path
          d="M100 10 C180 40 190 120 160 200 C140 260 80 280 40 250 C10 230 10 170 30 120 C50 60 60 20 100 10 Z"
          fill={color}
          fillOpacity={opacity}
        />
      </svg>
    </motion.div>
  );
}

/* ─── Animated SVG Path Drawer ─── */
export function DrawPath({
  d,
  stroke = "#6E9277",
  strokeWidth = 2,
  opacity = 0.3,
  duration = 2,
  delay = 0,
  width = 400,
  height = 200,
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  width?: number;
  height?: number;
}) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height }}>
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration, delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ─── Ornamental Rule ─── */
export function OrnamentalRule({ color = "#6E9277" }: { color?: string }) {
  return (
    <div className="flex items-center gap-4 my-2" aria-hidden="true">
      <div className="flex-1 h-px opacity-20" style={{ backgroundColor: color }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 0.5 L8.3 5.7 L13.5 7 L8.3 8.3 L7 13.5 L5.7 8.3 L0.5 7 L5.7 5.7 Z" fill={color} opacity="0.45" />
      </svg>
      <div className="flex-1 h-px opacity-20" style={{ backgroundColor: color }} />
    </div>
  );
}

/* ─── Sparkles ─── */
export function Sparkles({ count = 8, color = "#EAC79A", className = "" }: { count?: number; color?: string; className?: string }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 15 + (i / count) * 70,
    y: 20 + Math.sin(i * 1.3) * 40,
    size: 3 + (i % 3) * 2,
    delay: i * 0.3,
    duration: 2 + (i % 3),
  }));
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {items.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -12, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          <svg width={s.size * 2} height={s.size * 2} viewBox="0 0 10 10">
            <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" fill={color} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
