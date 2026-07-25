"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  createMediaAssetAction,
  deleteMediaAssetAction,
  listMediaAssetsAction,
  updateMediaAssetAction,
} from "@/app/actions/media";
import {
  createPhotoAlbumAction,
  deletePhotoAlbumAction,
  listOrSeedPhotoAlbumsAction,
  listPhotoAlbumsAction,
  renamePhotoAlbumAction,
} from "@/app/actions/photo-albums";
import type { MediaAsset, PhotoAlbum } from "@/lib/db/schema";
import { isSupabaseBackendConfigured } from "@/lib/supabase/backend";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useColors } from "@/site/lib/themeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

type PhotoRow = {
  id: string;
  src: string;
  alt: string;
  albumId: string | null;
  albumName: string | null;
  storagePath?: string;
};

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function assetToRow(asset: MediaAsset, albums: PhotoAlbum[]): PhotoRow {
  return {
    id: asset.id,
    src: asset.publicUrl,
    alt: asset.alt ?? "Photo",
    albumId: asset.albumId ?? null,
    albumName: asset.albumId ? albums.find((a) => a.id === asset.albumId)?.name ?? null : null,
  };
}

function PhotoFormModal({
  photo,
  albums,
  onSave,
  onClose,
}: {
  photo?: PhotoRow;
  albums: PhotoAlbum[];
  onSave: (form: PhotoRow & { storagePath?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const c = useColors();
  const styles = useInlineFieldStyles();
  const useSupabase = isSupabaseBackendConfigured();
  const [form, setForm] = useState<PhotoRow & { storagePath?: string }>(
    photo ?? {
      id: "",
      src: "",
      alt: "",
      albumId: albums[0]?.id ?? null,
      albumName: albums[0]?.name ?? null,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.src.trim()) {
      setError("Please upload or paste an image.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save photo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: c.card, color: c.text, border: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <h3 className="text-base font-semibold">{photo ? "Edit photo" : "Add photo"}</h3>
          <button type="button" onClick={onClose} style={{ color: c.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {useSupabase ? (
            <AdminImageUpload
              folder="photos"
              onUploaded={({ publicUrl, path }) => {
                setForm((f) => ({ ...f, src: publicUrl, storagePath: path }));
              }}
            />
          ) : null}
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Image URL
            </span>
            <input
              value={form.src}
              onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          {form.src ? (
            <img src={form.src} alt="" className="w-full h-36 object-cover rounded-xl" />
          ) : null}
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Description
            </span>
            <input
              value={form.alt}
              onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Album
            </span>
            <select
              value={form.albumId ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  albumId: e.target.value || null,
                  albumName: albums.find((a) => a.id === e.target.value)?.name ?? null,
                }))
              }
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            >
              <option value="">Unassigned</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
        <div
          className="px-6 py-4 flex gap-3 justify-end"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: c.border, color: c.text }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={13} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Admin-only inline controls on the public Photos page:
 * create/rename/delete albums and add/edit/delete gallery photos.
 */
export function InlinePhotosEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const styles = useInlineFieldStyles();
  const useSupabase = isSupabaseBackendConfigured();
  const albumsRef = useRef<PhotoAlbum[]>([]);
  const dirtyRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [renameAlbum, setRenameAlbum] = useState<PhotoAlbum | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [photoForm, setPhotoForm] = useState<PhotoRow | undefined>();
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [pendingAlbumDelete, setPendingAlbumDelete] = useState<PhotoAlbum | null>(null);
  const [pendingPhotoDelete, setPendingPhotoDelete] = useState<PhotoRow | null>(null);

  const applyAlbums = useCallback((rows: PhotoAlbum[]) => {
    albumsRef.current = rows;
    setAlbums(rows);
  }, []);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    if (dirtyRef.current) {
      dirtyRef.current = false;
      // Refresh once on close so album cards update; safer than refreshing after every mutation.
      window.setTimeout(() => router.refresh(), 100);
    }
  }, [router]);

  const loadLibrary = useCallback(async () => {
    if (!useSupabase) return;
    setLoading(true);
    setError("");
    try {
      const albumRows = await withTimeout(
        listOrSeedPhotoAlbumsAction(),
        15_000,
        "Loading albums"
      );
      applyAlbums(albumRows);
      const assets = await withTimeout(listMediaAssetsAction("photos"), 15_000, "Loading photos");
      setPhotos(assets.map((a) => assetToRow(a, albumRows)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load gallery.");
    } finally {
      setLoading(false);
    }
  }, [useSupabase, applyAlbums]);

  useEffect(() => {
    if (open) void loadLibrary();
  }, [open, loadLibrary]);

  if (!canEdit) return <>{children}</>;

  const createAlbum = async () => {
    const name = newAlbumName.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    setSavedNote("");
    try {
      const created = await withTimeout(createPhotoAlbumAction(name), 15_000, "Creating album");
      applyAlbums(
        [...albumsRef.current, created].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
        )
      );
      setNewAlbumName("");
      setShowCreateAlbum(false);
      setSavedNote("Album created.");
      markDirty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create album.");
    } finally {
      setBusy(false);
    }
  };

  const submitRename = async () => {
    if (!renameAlbum) return;
    const next = renameValue.trim();
    if (!next || next === renameAlbum.name) {
      setRenameAlbum(null);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const updated = await withTimeout(
        renamePhotoAlbumAction(renameAlbum.id, next),
        15_000,
        "Renaming album"
      );
      applyAlbums(albumsRef.current.map((a) => (a.id === updated.id ? updated : a)));
      setPhotos((prev) =>
        prev.map((p) => (p.albumId === updated.id ? { ...p, albumName: updated.name } : p))
      );
      setRenameAlbum(null);
      setSavedNote("Album renamed.");
      markDirty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rename album.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteAlbum = async () => {
    if (!pendingAlbumDelete) return;
    const id = pendingAlbumDelete.id;
    setBusy(true);
    setError("");
    try {
      const remaining = await withTimeout(deletePhotoAlbumAction(id), 15_000, "Deleting album");
      applyAlbums(remaining);
      setPhotos((prev) =>
        prev.map((p) => (p.albumId === id ? { ...p, albumId: null, albumName: null } : p))
      );
      setPendingAlbumDelete(null);
      setSavedNote("Album deleted. Photos are now Unassigned.");
      markDirty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete album.");
      setPendingAlbumDelete(null);
      try {
        applyAlbums(await listPhotoAlbumsAction());
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  };

  const savePhoto = async (form: PhotoRow & { storagePath?: string }) => {
    setError("");
    setSavedNote("");
    if (form.id) {
      await withTimeout(
        updateMediaAssetAction(form.id, {
          alt: form.alt,
          category: "Community",
          publicUrl: form.src,
          albumId: form.albumId ?? null,
        }),
        20_000,
        "Saving photo"
      );
    } else {
      await withTimeout(
        createMediaAssetAction({
          path: form.storagePath ?? form.src.split("/storage/v1/object/public/media/")[1] ?? "",
          publicUrl: form.src,
          folder: "photos",
          alt: form.alt,
          category: "Community",
          albumId: form.albumId ?? null,
        }),
        20_000,
        "Saving photo"
      );
    }
    const assets = await listMediaAssetsAction("photos");
    setPhotos(assets.map((a) => assetToRow(a, albumsRef.current)));
    setSavedNote("Photo saved to the live gallery.");
    markDirty();
  };

  const confirmDeletePhoto = async () => {
    if (!pendingPhotoDelete) return;
    setBusy(true);
    setError("");
    try {
      await withTimeout(
        deleteMediaAssetAction(pendingPhotoDelete.id),
        20_000,
        "Deleting photo"
      );
      setPhotos((prev) => prev.filter((p) => p.id !== pendingPhotoDelete.id));
      setPendingPhotoDelete(null);
      setSavedNote("Photo removed.");
      markDirty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete photo.");
      setPendingPhotoDelete(null);
    } finally {
      setBusy(false);
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
        title="Edit photo gallery"
      >
        <Pencil size={12} /> Edit gallery
      </button>

      {open ? (
        <InlineEditDrawer
          title="Photo gallery"
          subtitle="Albums & photos"
          onClose={closeDrawer}
        >
          <p className="text-xs" style={styles.help}>
            Same albums as Photo Library. Create albums, then add photos into them.
            Empty slots stay empty; images are never reused across sections.
          </p>

          <button
            type="button"
            onClick={() => {
              setNewAlbumName("");
              setShowCreateAlbum(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: styles.green }}
          >
            <FolderPlus size={14} /> Create album
          </button>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm" style={styles.help}>
              Loading…
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold" style={styles.label}>
                Albums ({albums.length})
              </p>
              {albums.length === 0 ? (
                <p className="text-xs" style={styles.help}>
                  No albums yet. Create one to group photos.
                </p>
              ) : (
                <ul className="space-y-2">
                  {albums.map((album) => {
                    const count = photos.filter((p) => p.albumId === album.id).length;
                    return (
                      <li
                        key={album.id}
                        className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                        style={{ borderColor: styles.border }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                            {album.name}
                          </p>
                          <p className="text-[11px]" style={styles.help}>
                            {count} photo{count === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            className="p-2 rounded-lg"
                            style={{ color: styles.green }}
                            onClick={() => {
                              setRenameAlbum(album);
                              setRenameValue(album.name);
                            }}
                            title="Rename"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-lg text-red-500"
                            onClick={() => setPendingAlbumDelete(album)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <hr style={{ borderColor: styles.border }} />

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold" style={styles.label}>
                  Photos ({photos.length})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoForm(undefined);
                    setShowPhotoForm(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: styles.green }}
                >
                  <Plus size={12} /> Add photo
                </button>
              </div>

              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="flex items-center gap-2 rounded-xl border p-2"
                    style={{ borderColor: styles.border }}
                  >
                    <img
                      src={photo.src}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: styles.text }}>
                        {photo.alt || "Photo"}
                      </p>
                      <p className="text-[11px] truncate" style={styles.help}>
                        {photo.albumName || "Unassigned"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="p-2 rounded-lg"
                      style={{ color: styles.green }}
                      onClick={() => {
                        setPhotoForm(photo);
                        setShowPhotoForm(true);
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg text-red-500"
                      onClick={() => setPendingPhotoDelete(photo)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </InlineEditDrawer>
      ) : null}

      {showCreateAlbum ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !busy && setShowCreateAlbum(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: styles.cardBg, border: `1px solid ${styles.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-3" style={{ color: styles.text }}>
              Create album
            </h3>
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Album name"
              className="w-full rounded-xl border px-3 py-2.5 text-sm mb-4 focus:outline-none"
              style={styles.input}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void createAlbum();
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateAlbum(false)}
                className="px-4 py-2 rounded-xl text-sm border"
                style={{ borderColor: styles.border, color: styles.text }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !newAlbumName.trim()}
                onClick={() => void createAlbum()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: styles.green }}
              >
                {busy ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {renameAlbum ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !busy && setRenameAlbum(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: styles.cardBg, border: `1px solid ${styles.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-3" style={{ color: styles.text }}>
              Rename album
            </h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm mb-4 focus:outline-none"
              style={styles.input}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRenameAlbum(null)}
                className="px-4 py-2 rounded-xl text-sm border"
                style={{ borderColor: styles.border, color: styles.text }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !renameValue.trim()}
                onClick={() => void submitRename()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: styles.green }}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showPhotoForm ? (
          <PhotoFormModal
            photo={photoForm}
            albums={albums}
            onSave={savePhoto}
            onClose={() => {
              setShowPhotoForm(false);
              setPhotoForm(undefined);
            }}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingAlbumDelete)}
        title="Delete album?"
        message={
          pendingAlbumDelete
            ? `Delete "${pendingAlbumDelete.name}"? Photos stay and become Unassigned.`
            : "Photos stay and become Unassigned."
        }
        confirmLabel="Delete album"
        danger
        busy={busy}
        onCancel={() => !busy && setPendingAlbumDelete(null)}
        onConfirm={() => void confirmDeleteAlbum()}
      />

      <ConfirmDialog
        open={Boolean(pendingPhotoDelete)}
        title="Delete this photo?"
        message="It will be removed from the live gallery."
        confirmLabel="Delete"
        danger
        busy={busy}
        onCancel={() => !busy && setPendingPhotoDelete(null)}
        onConfirm={() => void confirmDeletePhoto()}
      />
    </div>
  );
}
