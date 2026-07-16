"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  renamePhotoAlbumAction,
} from "@/app/actions/photo-albums";
import type { MediaAsset, PhotoAlbum } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseBackendConfigured } from "@/lib/supabase/backend";
import { deleteStorageObject } from "@/lib/supabase/storage";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useSiteStore, type Photo } from "@/site/lib/siteStore";

type PhotoForm = Omit<Photo, "id"> & { storagePath?: string };

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
  const router = useRouter();
  const { photos, addPhoto, updatePhoto, deletePhoto } = useSiteStore();
  const useSupabase = isSupabaseBackendConfigured();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [remotePhotos, setRemotePhotos] = useState<Photo[]>([]);
  const [remoteAssets, setRemoteAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(useSupabase);
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Photo | undefined>();
  const [newAlbumName, setNewAlbumName] = useState("");
  const [albumBusy, setAlbumBusy] = useState(false);
  const [error, setError] = useState("");

  const loadAlbums = useCallback(async () => {
    if (!useSupabase) return;
    const rows = await listOrSeedPhotoAlbumsAction();
    setAlbums(rows);
    return rows;
  }, [useSupabase]);

  const loadRemotePhotos = useCallback(async () => {
    if (!useSupabase) return;
    setLoading(true);
    try {
      const albumRows = await loadAlbums();
      const assets = await listMediaAssetsAction("photos");
      setRemoteAssets(assets);
      setRemotePhotos(assets.map((asset) => assetToPhoto(asset, albumRows ?? albums)));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not load photos");
    } finally {
      setLoading(false);
    }
  }, [useSupabase, loadAlbums, albums]);

  useEffect(() => {
    void loadRemotePhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [useSupabase]);

  const displayPhotos = useSupabase ? remotePhotos : photos;
  const filtered =
    activeAlbum === "All"
      ? displayPhotos
      : activeAlbum === "Unassigned"
        ? displayPhotos.filter((p) => !p.albumId)
        : displayPhotos.filter((p) => p.albumId === activeAlbum);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    setAlbumBusy(true);
    setError("");
    try {
      await createPhotoAlbumAction(newAlbumName.trim());
      setNewAlbumName("");
      await loadAlbums();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create album");
    } finally {
      setAlbumBusy(false);
    }
  };

  const handleRenameAlbum = async (album: PhotoAlbum) => {
    const next = window.prompt("Rename album", album.name);
    if (!next || next.trim() === album.name) return;
    setAlbumBusy(true);
    try {
      await renamePhotoAlbumAction(album.id, next.trim());
      await loadRemotePhotos();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rename album");
    } finally {
      setAlbumBusy(false);
    }
  };

  const handleDeleteAlbum = async (album: PhotoAlbum) => {
    if (
      !confirm(
        `Delete album "${album.name}"? Photos in this album stay on the site and become Unassigned.`
      )
    ) {
      return;
    }
    setAlbumBusy(true);
    try {
      await deletePhotoAlbumAction(album.id);
      if (activeAlbum === album.id) setActiveAlbum("All");
      await loadRemotePhotos();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete album");
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

    if (editing) {
      await updateMediaAssetAction(editing.id, {
        alt: form.alt,
        category: form.category || "Community",
        publicUrl: form.src,
        albumId: form.albumId ?? null,
      });
      await loadRemotePhotos();
      router.refresh();
      return;
    }

    await createMediaAssetAction({
      path: form.storagePath ?? form.src.split("/storage/v1/object/public/media/")[1] ?? "",
      publicUrl: form.src,
      folder: "photos",
      alt: form.alt,
      category: form.category || "Community",
      albumId: form.albumId ?? null,
    });
    await loadRemotePhotos();
    router.refresh();
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm("Delete photo?")) return;

    if (!useSupabase) {
      deletePhoto(photo.id);
      return;
    }

    const asset = remoteAssets.find((a) => a.id === photo.id);
    if (!asset) return;

    await deleteStorageObject(createClient(), asset.path);
    await deleteMediaAssetAction(asset.id);
    await loadRemotePhotos();
    router.refresh();
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
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#6E9277" }}
        >
          <Plus size={15} /> Add Photo
        </motion.button>
      </div>

      {useSupabase ? (
        <div className="bg-card rounded-2xl border border-muted p-5 mb-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Albums</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Create albums with any name. Suggested starters appear the first time you open this page.
              Visitors filter the Photos page by album.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="New album name"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateAlbum();
              }}
            />
            <motion.button
              whileHover={{ scale: albumBusy ? 1 : 1.03 }}
              whileTap={{ scale: albumBusy ? 1 : 0.97 }}
              disabled={albumBusy || !newAlbumName.trim()}
              onClick={() => void handleCreateAlbum()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#6E9277" }}
            >
              <FolderPlus size={15} /> Create album
            </motion.button>
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
                      onClick={() => void handleRenameAlbum(album)}
                      className="text-xs font-semibold text-[#6E9277] hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteAlbum(album)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
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
                      setShowModal(true);
                    }}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-foreground"
                  >
                    <Pencil size={13} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => void handleDelete(photo)}
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
              setShowModal(true);
            }}
            className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 text-muted-foreground hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Plus size={24} />
            <span className="text-xs font-semibold">Add Photo</span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <PhotoModal
            photo={editing}
            albums={albums}
            useSupabase={useSupabase}
            onSave={(f) => void handleSave(f)}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
