"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Save, Pencil } from "lucide-react";
import { useSiteStore, Photo } from "@/site/lib/siteStore";

const CATEGORIES = ["All", "Education", "Community", "Worship", "Outreach"];

function PhotoModal({ photo, onSave, onClose }: { photo?: Photo; onSave: (p: Omit<Photo, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Photo, "id">>(photo ?? { src: "", alt: "", category: "Community" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3d9ce]">
          <h3 className="text-base text-[#474747]">{photo ? "Edit Photo" : "Add Photo"}</h3>
          <button onClick={onClose} className="text-[#7a7068]"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Image URL</label>
            <input value={form.src} onChange={(e) => set("src", e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          {form.src && <img src={form.src} alt="Preview" className="w-full h-40 object-cover rounded-xl" />}
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Alt Text</label>
            <input value={form.alt} onChange={(e) => set("alt", e.target.value)} placeholder="Describe the image..." className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
              {CATEGORIES.filter(c => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#e3d9ce] flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#474747] border border-[#e3d9ce] hover:bg-[#EFE7DB]">Cancel</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: "#6E9277" }}>
            <Save size={13} /> Save
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPhotos() {
  const { photos, addPhoto, updatePhoto, deletePhoto } = useSiteStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Photo | undefined>();

  const filtered = activeCategory === "All" ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-[#474747]">Photo Library</h1>
          <p className="text-sm text-[#7a7068]">{photos.length} photos</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
          <Plus size={15} /> Add Photo
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ backgroundColor: activeCategory === cat ? "#6E9277" : "#ffffff", color: activeCategory === cat ? "#ffffff" : "#474747", border: activeCategory === cat ? "none" : "1px solid #e3d9ce" }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((photo, i) => (
            <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-2xl overflow-hidden bg-[#e3d9ce] aspect-square">
              <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditing(photo); setShowModal(true); }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#474747]"><Pencil size={13} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { if (confirm("Delete photo?")) deletePhoto(photo.id); }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500"><Trash2 size={13} /></motion.button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs truncate">{photo.alt}</p>
                <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "#6E9277" }}>{photo.category}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add new tile */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
          style={{ borderColor: "rgba(110,146,119,0.4)", color: "#7a7068" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6E9277")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(110,146,119,0.4)")}>
          <Plus size={24} />
          <span className="text-xs font-semibold">Add Photo</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && (
          <PhotoModal photo={editing} onSave={(f) => editing ? updatePhoto(editing.id, f) : addPhoto(f)} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
