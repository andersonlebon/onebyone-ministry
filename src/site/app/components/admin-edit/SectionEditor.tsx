"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Save, Upload, Loader2 } from "lucide-react";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { createClient } from "@/lib/supabase/client";
import { uploadToMediaBucket } from "@/lib/supabase/storage";
import { updateSettingsAction } from "@/app/actions/site-content";
import { updateSiteMediaSlotAction, type SiteMediaSlotPath } from "@/app/actions/site-media";
import { useSiteContent } from "@/site/lib/siteContentContext";
import type { SiteSettings } from "@/lib/site-content/types";

type Field =
  | { kind: "text"; key: keyof SiteSettings; label: string; multiline?: boolean }
  | { kind: "image"; path: SiteMediaSlotPath; label: string; help?: string };

export function SectionEditor({
  title,
  fields,
  children,
}: {
  title: string;
  fields: Field[];
  children: ReactNode;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { settings } = useSiteContent();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!canEdit) return <>{children}</>;

  const openEditor = () => {
    const next: Partial<SiteSettings> = {};
    for (const f of fields) {
      if (f.kind === "text") next[f.key] = settings[f.key] ?? "";
    }
    setDraft(next);
    setError("");
    setSaved(false);
    setOpen(true);
  };

  const saveText = async () => {
    setSaving(true);
    setError("");
    try {
      await updateSettingsAction({ ...settings, ...draft } as SiteSettings);
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (path: SiteMediaSlotPath, file: File) => {
    const key = path.join(".");
    setUploading(key);
    setError("");
    try {
      const supabase = createClient();
      const { path: storagePath, publicUrl } = await uploadToMediaBucket(supabase, file, "general");
      void storagePath;
      await updateSiteMediaSlotAction(path, publicUrl);
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const hasText = fields.some((f) => f.kind === "text");

  return (
    <div className="relative group/section">
      {children}
      <button
        type="button"
        onClick={openEditor}
        className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100"
        style={{ backgroundColor: "#6E9277" }}
        title={`Edit ${title}`}
      >
        <Pencil size={12} /> Edit
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#6E9277]">Edit on this page</p>
                <h3 className="text-base font-semibold text-[#474747]">{title}</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-[#474747]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {fields.map((field) => {
                if (field.kind === "text") {
                  const value = String(draft[field.key] ?? "");
                  return (
                    <label key={field.key} className="block">
                      <span className="block text-xs font-semibold text-[#474747] mb-1.5">{field.label}</span>
                      {field.multiline ? (
                        <textarea
                          rows={4}
                          value={value}
                          onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#6E9277]"
                          style={{ borderColor: "rgba(110,146,119,0.35)" }}
                        />
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#6E9277]"
                          style={{ borderColor: "rgba(110,146,119,0.35)" }}
                        />
                      )}
                    </label>
                  );
                }

                const key = field.path.join(".");
                return (
                  <div key={key}>
                    <p className="text-xs font-semibold text-[#474747] mb-1.5">{field.label}</p>
                    {field.help ? <p className="text-xs text-[#6b7280] mb-2">{field.help}</p> : null}
                    <label className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: "#6E9277" }}>
                      {uploading === key ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading === key ? "Uploading…" : "Upload new photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={Boolean(uploading)}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadImage(field.path, file);
                        }}
                      />
                    </label>
                  </div>
                );
              })}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="text-sm text-[#6E9277]">Saved to the live site.</p> : null}

              {hasText ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveText()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: "#6E9277" }}
                >
                  <Save size={14} /> {saving ? "Saving…" : "Save changes"}
                </button>
              ) : null}

              <p className="text-xs text-[#6b7280]">
                Full tools (bulk photos, finance) stay in the admin dashboard.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
