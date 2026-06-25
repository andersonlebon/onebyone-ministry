"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Save, Pencil } from "lucide-react";

import {
  createMediaAssetAction,
  deleteMediaAssetAction,
  listMediaAssetsAction,
  updateMediaAssetAction,
} from "@/app/actions/media";
import type { MediaAsset } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseBackendConfigured } from "@/lib/supabase/backend";
import { deleteStorageObject } from "@/lib/supabase/storage";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { demoModeLabel } from "@/site/lib/demo-ui";
import { useSiteStore, type Photo } from "@/site/lib/siteStore";

const CATEGORIES = ["All", "Education", "Community", "Worship", "Outreach"];

function PhotoModal({
  photo,
  onSave,
  onClose,
  useSupabase,
}: {
  photo?: Photo;
  onSave: (p: Omit<Photo, "id"> & { storagePath?: string }) => void;
  onClose: () => void;
  useSupabase: boolean;
}) {
  const [form, setForm] = useState<Omit<Photo, "id"> & { storagePath?: string }>(
    photo ?? { src: "", alt: "", category: "Community" }
  );
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
          {form.src && <img src={form.src} alt="Preview" className="w-full h-40 object-cover rounded-xl" />}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Alt Text</label>
            <input
              value={form.alt}
              onChange={(e) => set("alt", e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
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

function assetToPhoto(asset: MediaAsset): Photo {
  return {
    id: asset.id,
    src: asset.publicUrl,
    alt: asset.alt ?? "Photo",
    category: asset.category ?? "Community",
  };
}

export default function AdminPhotos() {
  const router = useRouter();
  const { photos, addPhoto, updatePhoto, deletePhoto } = useSiteStore();
  const useSupabase = isSupabaseBackendConfigured();
  const [remotePhotos, setRemotePhotos] = useState<Photo[]>([]);
  const [remoteAssets, setRemoteAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(useSupabase);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Photo | undefined>();

  const loadRemotePhotos = useCallback(async () => {
    if (!useSupabase) return;
    setLoading(true);
    try {
      const assets = await listMediaAssetsAction("photos");
      setRemoteAssets(assets);
      setRemotePhotos(assets.map(assetToPhoto));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [useSupabase]);

  useEffect(() => {
    void loadRemotePhotos();
  }, [loadRemotePhotos]);

  const displayPhotos = useSupabase ? remotePhotos : photos;
  const filtered =
    activeCategory === "All"
      ? displayPhotos
      : displayPhotos.filter((p) => p.category === activeCategory);

  const handleSave = async (form: Omit<Photo, "id"> & { storagePath?: string }) => {
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
        category: form.category,
        publicUrl: form.src,
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
      category: form.category,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Photo Library</h1>
          <p className="text-sm text-muted-foreground">
            {displayPhotos.length} photos
            {useSupabase ? " · stored in Supabase" : demoModeLabel() ? ` · ${demoModeLabel()}` : ""}
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

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-card text-foreground border-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading photos from Supabase...</div>
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
                    {photo.category}
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
            useSupabase={useSupabase}
            onSave={(f) => void handleSave(f)}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
