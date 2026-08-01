"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Pencil, Save, Upload, Loader2 } from "lucide-react";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { createClient } from "@/lib/supabase/client";
import { uploadToMediaBucket } from "@/lib/supabase/storage";
import { updateSettingsAction } from "@/app/actions/site-content";
import { updateSiteMediaSlotAction, type SiteMediaSlotPath } from "@/app/actions/site-media";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import type { SiteMediaBundle } from "@/lib/media/types";
import {
  getHeroHeadlineLines,
  normalizeHeroHeadlineLines,
  syncHeroHeadlineFromLines,
  type HeroHeadlineLine,
} from "@/lib/site-content/hero-headline";
import type { SiteSettings } from "@/lib/site-content/types";
import { HeroHeadlineLinesFields } from "./HeroHeadlineLinesFields";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

type Field =
  | { kind: "text"; key: keyof SiteSettings; label: string; multiline?: boolean }
  | { kind: "heroLines"; label?: string }
  | { kind: "image"; path: SiteMediaSlotPath; label: string; help?: string };

function getMediaSlotUrl(media: SiteMediaBundle, path: SiteMediaSlotPath): string {
  const [group, key] = path;
  if (group === "websiteUseImages") return media.websiteUseImages[key] ?? "";
  return media.localImages[key] ?? "";
}

function ImageSlotPreview({
  src,
  label,
  uploading,
}: {
  src: string;
  label: string;
  uploading: boolean;
}) {
  const styles = useInlineFieldStyles();
  const busted = useMediaUrl(src);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border mb-3"
      style={{ borderColor: styles.border, backgroundColor: styles.cardBg, aspectRatio: "16 / 9" }}
    >
      {busted ? (
        <img src={busted} alt={`Current ${label}`} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ color: styles.muted }}>
          <ImageIcon size={28} />
          <span className="text-xs">No photo yet</span>
        </div>
      )}
      {uploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <Loader2 size={22} className="animate-spin text-white" />
        </div>
      ) : null}
      <span
        className="absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        Current photo
      </span>
    </div>
  );
}

export function SectionEditor({
  title,
  fields,
  children,
  /** Hero banners sit under the fixed navbar; use "hero" so the Edit button stays visible. */
  placement = "default",
  buttonLabel = "Edit",
}: {
  title: string;
  fields: Field[];
  children: ReactNode;
  placement?: "default" | "hero";
  buttonLabel?: string;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { settings } = useSiteContent();
  const media = useSiteMedia();
  const styles = useInlineFieldStyles();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<SiteSettings>>({});
  const [heroLinesDraft, setHeroLinesDraft] = useState<HeroHeadlineLine[]>([]);
  /** Local overrides so a just-uploaded image shows in the preview before refresh. */
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) setImageOverrides({});
  }, [open]);

  if (!canEdit) return <>{children}</>;

  const buttonClass =
    placement === "hero"
      ? "absolute top-24 sm:top-28 right-3 z-[60] flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-95 hover:opacity-100"
      : "absolute top-3 right-3 z-40 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100";

  const openEditor = () => {
    const next: Partial<SiteSettings> = {};
    let nextHeroLines: HeroHeadlineLine[] = [];
    for (const f of fields) {
      if (f.kind === "text") {
        const value = settings[f.key];
        (next as Record<string, unknown>)[f.key] = typeof value === "string" ? value : "";
      }
      if (f.kind === "heroLines") nextHeroLines = getHeroHeadlineLines(settings);
    }
    setDraft(next);
    setHeroLinesDraft(nextHeroLines);
    setImageOverrides({});
    setError("");
    setSaved(false);
    setOpen(true);
  };

  const saveText = async () => {
    setSaving(true);
    setError("");
    try {
      const hasHeroLines = fields.some((f) => f.kind === "heroLines");
      const normalizedLines = hasHeroLines
        ? normalizeHeroHeadlineLines(heroLinesDraft)
        : settings.heroHeadlineLines;
      const payload = {
        ...settings,
        ...draft,
        ...(hasHeroLines
          ? {
              heroHeadlineLines: normalizedLines,
              heroHeadline: syncHeroHeadlineFromLines(normalizedLines),
            }
          : {}),
      } as SiteSettings;
      await updateSettingsAction(payload);
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
    const localPreview = URL.createObjectURL(file);
    setImageOverrides((prev) => ({ ...prev, [key]: localPreview }));
    setUploading(key);
    setError("");
    try {
      const supabase = createClient();
      const { path: storagePath, publicUrl } = await uploadToMediaBucket(supabase, file, "general");
      void storagePath;
      await updateSiteMediaSlotAction(path, publicUrl);
      setImageOverrides((prev) => ({ ...prev, [key]: publicUrl }));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setImageOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(null);
    }
  };

  const hasSavableFields =
    fields.some((f) => f.kind === "text") || fields.some((f) => f.kind === "heroLines");

  return (
    <div className="relative group/section">
      {children}
      <button
        type="button"
        onClick={openEditor}
        className={buttonClass}
        style={{ backgroundColor: styles.green }}
        title={`Edit ${title}`}
      >
        <Pencil size={12} /> {buttonLabel}
      </button>

      {open ? (
        <InlineEditDrawer title={title} onClose={() => setOpen(false)}>
          {fields.map((field) => {
            if (field.kind === "text") {
              const value = String(draft[field.key] ?? "");
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
            }

            if (field.kind === "heroLines") {
              return (
                <HeroHeadlineLinesFields
                  key="hero-lines"
                  lines={heroLinesDraft}
                  onChange={setHeroLinesDraft}
                  styles={styles}
                />
              );
            }

            const key = field.path.join(".");
            const previewSrc = imageOverrides[key] || getMediaSlotUrl(media, field.path);
            return (
              <div key={key}>
                <p className="text-xs font-semibold mb-1.5" style={styles.label}>
                  {field.label}
                </p>
                {field.help ? (
                  <p className="text-xs mb-2" style={styles.help}>
                    {field.help}
                  </p>
                ) : null}
                <ImageSlotPreview
                  src={previewSrc}
                  label={field.label}
                  uploading={uploading === key}
                />
                <label
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: styles.green }}
                >
                  {uploading === key ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading === key ? "Uploading…" : "Replace photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={Boolean(uploading)}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(field.path, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            );
          })}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {saved ? (
            <p className="text-sm" style={{ color: styles.green }}>
              Saved to the live site.
            </p>
          ) : null}

          {hasSavableFields ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveText()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: styles.green }}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save changes"}
            </button>
          ) : null}

          <p className="text-xs" style={styles.help}>
            Full tools (bulk photos, finance) stay in the admin dashboard.
          </p>
        </InlineEditDrawer>
      ) : null}
    </div>
  );
}
