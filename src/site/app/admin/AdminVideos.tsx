"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Play } from "lucide-react";
import { useSiteStore, Video } from "@/site/lib/siteStore";

const CATEGORIES = ["Education", "Entrepreneurship", "Discipleship", "Community", "Documentary", "Report"];

function VideoModal({ video, onSave, onClose }: { video?: Video; onSave: (v: Omit<Video, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Video, "id">>(video ?? { youtubeId: "", title: "", category: "Documentary", duration: "", thumb: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">{video ? "Edit Video" : "Add Video"}</h3>
          <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">YouTube Video ID</label>
            <input value={form.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} placeholder="dQw4w9WgXcQ" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            <p className="text-xs text-muted-foreground mt-1">Paste the ID from the YouTube URL (after ?v=)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Video title" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Duration</label>
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="12:34" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Thumbnail URL</label>
            <input value={form.thumb} onChange={(e) => set("thumb", e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          {form.thumb && <img src={form.thumb} alt="Thumb" className="w-full h-32 object-cover rounded-xl" />}
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted">Cancel</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: "#6E9277" }}>
            <Save size={13} /> Save
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminVideos() {
  const { videos, addVideo, updateVideo, deleteVideo } = useSiteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Video | undefined>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Videos</h1>
          <p className="text-sm text-muted-foreground">{videos.length} videos · shows on the Videos page</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
          <Plus size={15} /> Add Video
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {videos.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-muted overflow-hidden hover:shadow-sm">
              <div className="relative aspect-video bg-muted">
                <img src={video.thumb} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                    <Play size={16} style={{ color: "#6E9277" }} className="ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{video.duration}</div>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-foreground mb-1">{video.title}</p>
                <p className="text-xs text-muted-foreground mb-3">{video.category}</p>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.08 }} onClick={() => { setEditing(video); setShowModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs border border-muted hover:bg-muted text-foreground">
                    <Pencil size={11} /> Edit
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.08 }} onClick={() => { if (confirm("Delete video?")) deleteVideo(video.id); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs border border-red-100 hover:bg-red-50 text-red-400">
                    <Trash2 size={11} /> Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && <VideoModal video={editing} onSave={(f) => editing ? updateVideo(editing.id, f) : addVideo(f)} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
