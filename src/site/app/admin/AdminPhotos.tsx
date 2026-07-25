"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Save, Pencil, FolderPlus } from "lucide-react";

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
import { ConfirmDialog } from "@/site/app/components/admin-edit/ConfirmDialog";
import { useSiteStore, type Photo } from "@/site/lib/siteStore";

type PhotoForm = Omit<Photo, "id"> & { storagePath?: string };

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

function PhotoModal({
  photo,
  albums,
  onSave,
  onClose,
  useSupabase,
}: {
  photo?: Photo;
  albums: PhotoAlbum[];
  onSave: (p: PhotoForm) => void;
  onClose: () => void;
  useSupabase: boolean;
}) {
  const [form, setForm] = useState<PhotoForm>(
    photo ?? { src: "", alt: "", category: "Community", albumId: albums[0]?.id ?? null }
  );
  const set = (k: keyof PhotoForm, v: string | null) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">{photo ? "Edit Photo" : "Add Photo"}</h3>
          <button onClick={onClose} className="text-muted-foreground">
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

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Image URL</label>
            <input
              value={form.src}
              onChange={(e) => set("src", e.target.value)}
              placeholder={useSupabase ? "Upload above or paste a URL" : "https://..."}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          {form.src ? <img src={form.src} alt="Preview" className="w-full h-40 object-cover rounded-xl" /> : null}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
            <input
              value={form.alt}
              onChange={(e) => set("alt", e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Album</label>
            <select
              value={form.albumId ?? ""}
              onChange={(e) => set("albumId", e.target.value || null)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            >
              <option value="">Unassigned</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Albums appear as filters on the public Photos page.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (form.src) {
                onSave(form);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#6E9277" }}
          >
            <Save size={13} /> Save
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateAlbumModal({
  busy,
  error,
  onClose,
  onCreate,
}: {
  busy: boolean;
  error: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-muted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Create album</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Albums group photos on the public Photos page. You can add photos to this album after it is created.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Album name"
          className="w-full px-3 py-2.5 rounded-xl border text-sm mb-3 focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) void onCreate(name.trim());
          }}
        />
        {error ? <p className="text-sm text-red-500 mb-3">{error}</p> : null}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border border-muted text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() => void onCreate(name.trim())}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 flex items-center gap-1.5"
            style={{ backgroundColor: "#6E9277" }}
          >
            <FolderPlus size={14} />
            {busy ? "Creating…" : "Create album"}
          </button>
        </div>
      </div>
    </div>
  );
}

function assetToPhoto(asset: MediaAsset, albums: PhotoAlbum[]): Photo {
  return {
    id: asset.id,
    src: asset.publicUrl,
    alt: asset.alt ?? "Photo",
    category: asset.category ?? "Community",
    albumId: asset.albumId ?? null,
    albumName: asset.albumId ? albums.find((a) => a.id === asset.albumId)?.name ?? null : null,
  };
}

export default function AdminPhotos() {
  const { photos, addPhoto, updatePhoto, deletePhoto } = useSiteStore();
  const useSupabase = isSupabaseBackendConfigured();
  const albumsRef = useRef<PhotoAlbum[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [remotePhotos, setRemotePhotos] = useState<Photo[]>([]);
  const [remoteAssets, setRemoteAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(useSupabase);
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [editing, setEditing] = useState<Photo | undefined>();
  const [albumBusy, setAlbumBusy] = useState(false);
  const [createAlbumError, setCreateAlbumError] = useState("");
  const [error, setError] = useState("");
  const [pendingPhotoDelete, setPendingPhotoDelete] = useState<Photo | null>(null);
  const [pendingAlbumDelete, setPendingAlbumDelete] = useState<PhotoAlbum | null>(null);
  const [renameAlbum, setRenameAlbum] = useState<PhotoAlbum | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const applyAlbums = useCallback((rows: PhotoAlbum[]) => {
    albumsRef.current = rows;
    setAlbums(rows);
  }, []);

  const refreshPhotos = useCallback(async (albumRows?: PhotoAlbum[]) => {
    if (!useSupabase) return;
    const assets = await withTimeout(listMediaAssetsAction("photos"), 15_000, "Loading photos");
    const list = albumRows ?? albumsRef.current;
    setRemoteAssets(assets);
    setRemotePhotos(assets.map((asset) => assetToPhoto(asset, list)));
  }, [useSupabase]);

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
      await refreshPhotos(albumRows);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not load photos");
    } finally {
      setLoading(false);
    }
  }, [useSupabase, applyAlbums, refreshPhotos]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const displayPhotos = useSupabase ? remotePhotos : photos;
  const filtered =
    activeAlbum === "All"
      ? displayPhotos
      : activeAlbum === "Unassigned"
        ? displayPhotos.filter((p) => !p.albumId)
        : displayPhotos.filter((p) => p.albumId === activeAlbum);

  const handleCreateAlbum = async (name: string) => {
    setAlbumBusy(true);
    setCreateAlbumError("");
    setError("");
    try {
      const created = await withTimeout(createPhotoAlbumAction(name), 15_000, "Creating album");
      applyAlbums([...albumsRef.current, created].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
      setShowCreateAlbum(false);
    } catch (err) {
      setCreateAlbumError(err instanceof Error ? err.message : "Could not create album");
    } finally {
      setAlbumBusy(false);
    }
  };

  const openRenameAlbum = (album: PhotoAlbum) => {
    setRenameAlbum(album);
    setRenameValue(album.name);
  };

  const submitRenameAlbum = async () => {
    if (!renameAlbum) return;
    const next = renameValue.trim();
    if (!next || next === renameAlbum.name) {
      setRenameAlbum(null);
      return;
    }
    setAlbumBusy(true);
    setError("");
    try {
      const updated = await withTimeout(
        renamePhotoAlbumAction(renameAlbum.id, next),
        15_000,
        "Renaming album"
      );
      applyAlbums(albumsRef.current.map((a) => (a.id === updated.id ? updated : a)));
      setRemotePhotos((prev) =>
        prev.map((p) => (p.albumId === updated.id ? { ...p, albumName: updated.name } : p))
      );
      setRenameAlbum(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rename album");
    } finally {
      setAlbumBusy(false);
    }
  };

  const confirmDeleteAlbum = async () => {
    if (!pendingAlbumDelete) return;
    const deletingId = pendingAlbumDelete.id;
    setAlbumBusy(true);
    setError("");
    try {
      const remaining = await withTimeout(
        deletePhotoAlbumAction(deletingId),
        15_000,
        "Deleting album"
      );
      applyAlbums(remaining);
      if (activeAlbum === deletingId) setActiveAlbum("All");
      setPendingAlbumDelete(null);
      // Photos stay; clear album assignment locally, then reload once.
      setRemotePhotos((prev) =>
        prev.map((p) =>
          p.albumId === deletingId ? { ...p, albumId: null, albumName: null } : p
        )
      );
      try {
        await refreshPhotos(remaining);
      } catch (reloadErr) {
        console.error(reloadErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete album");
      setPendingAlbumDelete(null);
      // Recover list if delete may have succeeded server-side
      try {
        const rows = await listPhotoAlbumsAction();
        applyAlbums(rows);
        await refreshPhotos(rows);
      } catch {
        /* keep optimistic UI */
      }
    } finally {
      setAlbumBusy(false);
    }
  };

  const handleSave = async (form: PhotoForm) => {
    if (!useSupabase) {
      if (editing) {
        updatePhoto(editing.id, form);
      } else {
        addPhoto(form);
      }
      return;
    }

    setError("");
    try {
      if (editing) {
        await withTimeout(
          updateMediaAssetAction(editing.id, {
            alt: form.alt,
            category: form.category || "Community",
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
            category: form.category || "Community",
            albumId: form.albumId ?? null,
          }),
          20_000,
          "Saving photo"
        );
      }
      await refreshPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save photo");
    }
  };

  const confirmDeletePhoto = async () => {
    if (!pendingPhotoDelete) return;
    setActionBusy(true);
    setError("");

    try {
      if (!useSupabase) {
        deletePhoto(pendingPhotoDelete.id);
        setPendingPhotoDelete(null);
        return;
      }

      const asset = remoteAssets.find((a) => a.id === pendingPhotoDelete.id);
      if (!asset) {
        setError("Could not find that photo to delete.");
        setPendingPhotoDelete(null);
        return;
      }

      await withTimeout(deleteMediaAssetAction(asset.id), 20_000, "Deleting photo");
      setPendingPhotoDelete(null);
      await refreshPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete photo. Please try again.");
      setPendingPhotoDelete(null);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Photo Library</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {displayPhotos.length} photos · These appear in the Photos gallery only.
            Page top banners are edited in Site Settings.
          </p>
        </div>
        {useSupabase ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCreateAlbumError("");
              setShowCreateAlbum(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#6E9277" }}
          >
            <FolderPlus size={15} /> Create album
          </motion.button>
        ) : null}
      </div>

      {useSupabase ? (
        <div className="bg-card rounded-2xl border border-muted p-5 mb-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Albums</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Create albums with the button above. Visitors browse the Photos page by album.
              Suggested starters appear the first time this page is empty.
            </p>
          </div>
          {albums.length > 0 ? (
            <ul className="space-y-2">
              {albums.map((album) => (
                <li
                  key={album.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-muted px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">{album.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openRenameAlbum(album)}
                      className="text-xs font-semibold text-[#6E9277] hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingAlbumDelete(album)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No albums yet. Create one to get started.</p>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadLibrary()}
            className="text-xs font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Unassigned", ...albums.map((a) => a.id)].map((key) => {
          const label =
            key === "All" || key === "Unassigned"
              ? key
              : albums.find((a) => a.id === key)?.name ?? key;
          return (
            <button
              key={key}
              onClick={() => setActiveAlbum(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activeAlbum === key
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card text-foreground border-muted"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading photos...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-2xl overflow-hidden bg-muted aspect-square"
              >
                <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      setEditing(photo);
                      setShowPhotoModal(true);
                    }}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-foreground"
                  >
                    <Pencil size={13} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setPendingPhotoDelete(photo)}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-red-500"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs truncate">{photo.alt}</p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: "#6E9277" }}
                  >
                    {photo.albumName || "Unassigned"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditing(undefined);
              setShowPhotoModal(true);
            }}
            className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 text-muted-foreground hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Plus size={24} />
            <span className="text-xs font-semibold">Add Photo</span>
          </motion.button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingPhotoDelete)}
        title="Delete this photo?"
        message="It will be removed from the live gallery."
        confirmLabel="Delete"
        danger
        busy={actionBusy}
        onCancel={() => setPendingPhotoDelete(null)}
        onConfirm={() => void confirmDeletePhoto()}
      />

      <ConfirmDialog
        open={Boolean(pendingAlbumDelete)}
        title="Delete album?"
        message={
          pendingAlbumDelete
            ? `Delete album "${pendingAlbumDelete.name}"? Photos in this album stay on the site and become Unassigned.`
            : "Photos in this album stay on the site and become Unassigned."
        }
        confirmLabel="Delete album"
        danger
        busy={albumBusy}
        onCancel={() => !albumBusy && setPendingAlbumDelete(null)}
        onConfirm={() => void confirmDeleteAlbum()}
      />

      {showCreateAlbum ? (
        <CreateAlbumModal
          busy={albumBusy}
          error={createAlbumError}
          onClose={() => !albumBusy && setShowCreateAlbum(false)}
          onCreate={handleCreateAlbum}
        />
      ) : null}

      {renameAlbum ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !albumBusy && setRenameAlbum(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-foreground mb-3">Rename album</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm mb-4 focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitRenameAlbum();
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRenameAlbum(null)}
                className="px-4 py-2 rounded-xl text-sm border border-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={albumBusy || !renameValue.trim()}
                onClick={() => void submitRenameAlbum()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#6E9277" }}
              >
                {albumBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showPhotoModal && (
          <PhotoModal
            photo={editing}
            albums={albums}
            useSupabase={useSupabase}
            onSave={(f) => void handleSave(f)}
            onClose={() => setShowPhotoModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
