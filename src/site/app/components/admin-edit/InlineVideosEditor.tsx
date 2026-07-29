"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { deleteVideoAction, saveVideoAction } from "@/app/actions/site-content";
import type { Video } from "@/lib/site-content/types";
import { parseYoutubeId, youtubeEmbedUrl, youtubePosterUrl } from "@/lib/youtube";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { useColors } from "@/site/lib/themeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

const CATEGORIES = [
  "Education",
  "Entrepreneurship",
  "Discipleship",
  "Community",
  "Documentary",
  "Report",
];

type VideoForm = Omit<Video, "id">;

function VideoFormModal({
  video,
  onSave,
  onClose,
}: {
  video?: Video;
  onSave: (form: VideoForm) => Promise<void>;
  onClose: () => void;
}) {
  const c = useColors();
  const styles = useInlineFieldStyles();
  const [form, setForm] = useState<VideoForm>(
    video ?? { youtubeId: "", title: "", category: "Documentary", duration: "", thumb: "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof VideoForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const parsedId = useMemo(() => parseYoutubeId(form.youtubeId), [form.youtubeId]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${styles.border}` }}
        >
          <h3 className="text-base font-semibold" style={{ color: styles.text }}>
            {video ? "Edit video" : "Add video"}
          </h3>
          <button type="button" onClick={onClose} style={{ color: styles.muted }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={styles.label}>
              YouTube URL or video ID
            </label>
            <input
              value={form.youtubeId}
              onChange={(e) => set("youtubeId", e.target.value)}
              placeholder="https://youtu.be/... or dQw4w9WgXcQ"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={styles.input}
            />
            <p className="text-xs mt-1" style={styles.help}>
              Paste a full YouTube link or the 11-character id. Preview uses the live player.
            </p>
            {parsedId ? (
              <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-black/10">
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl(parsedId)}
                  title="YouTube preview"
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : form.youtubeId.trim() ? (
              <p className="text-xs text-red-500 mt-2">
                Could not read a valid YouTube id from that value.
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Video title"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={styles.input}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={styles.input}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Duration
              </label>
              <input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="12:34"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Thumbnail URL (optional)
            </label>
            <input
              value={form.thumb}
              onChange={(e) => set("thumb", e.target.value)}
              placeholder="Leave blank to use YouTube’s poster"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={styles.input}
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>

        <div
          className="px-6 py-4 flex gap-3 justify-end"
          style={{ borderTop: `1px solid ${styles.border}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ color: styles.text, borderColor: styles.border }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !parsedId}
            onClick={() => {
              void (async () => {
                setSaving(true);
                setError("");
                try {
                  await onSave({
                    ...form,
                    youtubeId: parsedId,
                    thumb: form.thumb.trim() || youtubePosterUrl(parsedId),
                  });
                  onClose();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not save video.");
                } finally {
                  setSaving(false);
                }
              })();
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={13} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Admin-only control on the public Videos page to add/edit/delete YouTube videos.
 */
export function InlineVideosEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { videos: initialVideos } = useSiteContent();
  const styles = useInlineFieldStyles();
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [pendingDelete, setPendingDelete] = useState<null | { id: string; title: string }>(null);

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  if (!canEdit) return <>{children}</>;

  const afterMutation = (next: Video[]) => {
    setVideos(next);
    setSavedNote("Saved to the live site.");
    setShowForm(false);
    setEditing(undefined);
    setPendingDelete(null);
    router.refresh();
  };

  const saveVideo = async (form: VideoForm) => {
    setError("");
    setSavedNote("");
    const next = await saveVideoAction(editing ? { ...form, id: editing.id } : form);
    afterMutation(next);
  };

  const runDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    setError("");
    setSavedNote("");
    try {
      const next = await deleteVideoAction(pendingDelete.id);
      afterMutation(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete video.");
      setPendingDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative group/section">
      {children}
      <button
        type="button"
        onClick={() => {
          setError("");
          setSavedNote("");
          setOpen(true);
        }}
        className="absolute top-3 right-3 z-40 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100"
        style={{ backgroundColor: styles.green }}
        title="Edit videos"
      >
        <Pencil size={12} /> Edit videos
      </button>

      {open ? (
        <InlineEditDrawer title="Videos" onClose={() => setOpen(false)}>
          <p className="text-xs" style={styles.help}>
            Add a YouTube link or id. First video in the list is featured on this page. Changes save
            immediately.
          </p>

          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: styles.green }}
          >
            <Plus size={14} /> New video
          </button>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          {videos.length === 0 ? (
            <p className="text-sm text-center py-8" style={styles.help}>
              No videos yet. Add the first one.
            </p>
          ) : (
            <ul className="space-y-3">
              {videos.map((video, index) => {
                const id = parseYoutubeId(video.youtubeId);
                return (
                  <li
                    key={video.id}
                    className="flex items-center gap-2 rounded-xl border p-3"
                    style={{ borderColor: styles.border }}
                  >
                    <div
                      className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/10"
                      style={{ backgroundColor: styles.cardBg }}
                    >
                      {id ? (
                        <img
                          src={video.thumb || youtubePosterUrl(id)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                        {video.title || "Untitled"}
                      </p>
                      <p className="text-xs truncate" style={{ color: styles.muted }}>
                        {index === 0 ? "Featured · " : ""}
                        {video.category || "Video"}
                        {video.duration ? ` · ${video.duration}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="p-2 rounded-lg"
                      style={{ color: styles.green }}
                      onClick={() => {
                        setEditing(video);
                        setShowForm(true);
                      }}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={busyId === video.id}
                      className="p-2 rounded-lg text-red-500 disabled:opacity-50"
                      onClick={() =>
                        setPendingDelete({ id: video.id, title: video.title || "This video" })
                      }
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </InlineEditDrawer>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete video?"
        message={`"${pendingDelete?.title ?? "This video"}" will be permanently removed from the live site.`}
        confirmLabel="Delete"
        danger
        busy={Boolean(busyId)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void runDelete()}
      />

      <AnimatePresence>
        {showForm ? (
          <VideoFormModal
            video={editing}
            onSave={saveVideo}
            onClose={() => {
              setShowForm(false);
              setEditing(undefined);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
