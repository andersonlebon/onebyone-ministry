"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Pencil, Save, Upload } from "lucide-react";
import { updateAboutAction } from "@/app/actions/site-content";
import { updateAboutStoryImageAction } from "@/app/actions/site-media";
import { EMPTY_IMAGE } from "@/lib/media/placeholders";
import type { AboutPageContent } from "@/lib/site-content/types";
import { createClient } from "@/lib/supabase/client";
import { uploadToMediaBucket } from "@/lib/supabase/storage";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

type AboutTextKey = {
  [K in keyof AboutPageContent]: AboutPageContent[K] extends string ? K : never;
}[keyof AboutPageContent];

const STORY_IMAGE_LABELS = ["Large top photo", "Bottom left photo", "Bottom right photo"] as const;

function StoryImageSlot({
  index,
  src,
  uploading,
  onUpload,
  styles,
}: {
  index: number;
  src: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  styles: ReturnType<typeof useInlineFieldStyles>;
}) {
  const busted = useMediaUrl(src);
  const empty = !busted || busted === EMPTY_IMAGE || busted.endsWith("/empty.svg");

  return (
    <div>
      <p className="text-xs font-semibold mb-1.5" style={styles.label}>
        {STORY_IMAGE_LABELS[index]}
      </p>
      <div
        className="relative w-full overflow-hidden rounded-xl border mb-2"
        style={{
          borderColor: styles.border,
          backgroundColor: styles.cardBg,
          aspectRatio: index === 0 ? "16 / 9" : "4 / 3",
        }}
      >
        {!empty ? (
          <img
            src={busted}
            alt={`Current ${STORY_IMAGE_LABELS[index]}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ color: styles.muted }}
          >
            <ImageIcon size={28} />
            <span className="text-xs">No photo yet</span>
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        ) : null}
      </div>
      <label
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white cursor-pointer"
        style={{ backgroundColor: styles.green }}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading…" : empty ? "Upload photo" : "Replace photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

export function AboutContentEditor({
  title,
  fields,
  children,
  /** When true, show upload controls for the three Our Story collage photos. */
  storyImages = false,
}: {
  title: string;
  fields: { key: AboutTextKey; label: string; multiline?: boolean }[];
  children: ReactNode;
  storyImages?: boolean;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const media = useSiteMedia();
  const styles = useInlineFieldStyles();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Record<AboutTextKey, string>>>({});
  const [imageOverrides, setImageOverrides] = useState<Record<number, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!canEdit) return <>{children}</>;

  const openEditor = () => {
    const next: Partial<Record<AboutTextKey, string>> = {};
    for (const f of fields) next[f.key] = about[f.key] ?? "";
    setDraft(next);
    setImageOverrides({});
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

  const uploadStoryImage = async (index: number, file: File) => {
    const localPreview = URL.createObjectURL(file);
    setImageOverrides((prev) => ({ ...prev, [index]: localPreview }));
    setUploadingIndex(index);
    setError("");
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadToMediaBucket(supabase, file, "general");
      await updateAboutStoryImageAction(index, publicUrl);
      setImageOverrides((prev) => ({ ...prev, [index]: publicUrl }));
      router.refresh();
    } catch (err) {
      setImageOverrides((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingIndex(null);
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

          {storyImages ? (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs font-semibold mb-1" style={styles.label}>
                  Story photos
                </p>
                <p className="text-xs mb-2" style={styles.help}>
                  Upload the three collage photos on the right. Each save goes live immediately.
                </p>
              </div>
              {[0, 1, 2].map((index) => (
                <StoryImageSlot
                  key={index}
                  index={index}
                  src={
                    imageOverrides[index] ||
                    media.aboutStoryImages[index] ||
                    EMPTY_IMAGE
                  }
                  uploading={uploadingIndex === index}
                  onUpload={(file) => void uploadStoryImage(index, file)}
                  styles={styles}
                />
              ))}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={14} /> {saving ? "Saving…" : "Save text changes"}
          </button>
        </InlineEditDrawer>
      ) : null}
    </div>
  );
}
