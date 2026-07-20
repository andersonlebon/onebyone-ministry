"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useColors } from "@/site/lib/themeStore";

/** Theme-aware slide-over used by all public-page inline editors. */
export function InlineEditDrawer({
  title,
  subtitle = "Edit on this page",
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const c = useColors();

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md shadow-xl overflow-y-auto flex flex-col"
        style={{ backgroundColor: c.card, color: c.text, borderLeft: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: c.green }}>
              {subtitle}
            </p>
            <h3 className="text-base font-semibold" style={{ color: c.text }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: c.muted }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1">{children}</div>

        {footer ? (
          <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function useInlineFieldStyles() {
  const c = useColors();
  return {
    label: { color: c.text } as const,
    help: { color: c.muted } as const,
    input: {
      backgroundColor: c.inputBg,
      color: c.text,
      borderColor: c.border,
    } as const,
    hoverBg: c.hoverBg,
    cardBg: c.cream,
    border: c.border,
    text: c.text,
    muted: c.muted,
    green: c.green,
  };
}
