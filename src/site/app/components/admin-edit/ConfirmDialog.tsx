"use client";

import { useColors } from "@/site/lib/themeStore";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** In-app confirm dialog (no browser alert/confirm). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const c = useColors();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: c.card, color: c.text, border: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h3 id="confirm-title" className="text-base font-semibold mb-2" style={{ color: c.text }}>
          {title}
        </h3>
        <p id="confirm-message" className="text-sm leading-relaxed mb-6" style={{ color: c.muted }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm border disabled:opacity-60"
            style={{ color: c.text, borderColor: c.border, backgroundColor: c.hoverBg }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: danger ? "#b45353" : c.green }}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
