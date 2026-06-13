"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: "circle" | "cross" | "ring";
}

const COLORS = ["rgba(234,199,154,", "rgba(110,146,119,", "rgba(239,231,219,"];

export default function FloatingParticles({ count = 28, className = "" }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = canvas.offsetWidth || 800;
      const h = canvas.offsetHeight || 600;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.15),
      size: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.5 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      type: ["circle", "cross", "ring"][Math.floor(Math.random() * 3)] as Particle["type"],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color + "0.8)";
        ctx.strokeStyle = p.color + "0.6)";
        ctx.lineWidth = 1;

        if (p.type === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "cross") {
          ctx.beginPath();
          ctx.moveTo(p.x - p.size, p.y);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += (Math.random() - 0.5) * 0.01;
        p.opacity = Math.max(0.05, Math.min(0.65, p.opacity));

        // Wrap around
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
