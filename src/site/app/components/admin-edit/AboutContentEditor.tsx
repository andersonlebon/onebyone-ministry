"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save } from "lucide-react";
import { updateAboutAction } from "@/app/actions/site-content";
import type { AboutPageContent } from "@/lib/site-content/types";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

type AboutTextKey = {
  [K in keyof AboutPageContent]: AboutPageContent[K] extends string ? K : never;
}[keyof AboutPageContent];

export function AboutContentEditor({
  title,
  fields,
  children,
}: {
  title: string;
  fields: { key: AboutTextKey; label: string; multiline?: boolean }[];
  children: ReactNode;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const styles = useInlineFieldStyles();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Record<AboutTextKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!canEdit) return <>{children}</>;

  const openEditor = () => {
    const next: Partial<Record<AboutTextKey, string>> = {};
    for (const f of fields) next[f.key] = about[f.key] ?? "";
    setDraft(next);
    setError("");
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateAboutAction(draft);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative group/section">
      {children}
      <button
        type="button"
        onClick={openEditor}
        className="absolute top-3 right-3 z-40 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100"
        style={{ backgroundColor: styles.green }}
        title={`Edit ${title}`}
      >
        <Pencil size={12} /> Edit
      </button>

      {open ? (
        <InlineEditDrawer title={title} onClose={() => setOpen(false)}>
          {fields.map((field) => {
            const value = draft[field.key] ?? "";
            return (
              <label key={field.key} className="block">
                <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                  {field.label}
                </span>
                {field.multiline ? (
                  <textarea
                    rows={4}
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
                    style={styles.input}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    style={styles.input}
                  />
                )}
              </label>
            );
          })}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={14} /> {saving ? "Saving…" : "Save changes"}
          </button>
        </InlineEditDrawer>
      ) : null}
    </div>
  );
}
