"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { useSiteStore, Project } from "@/site/lib/siteStore";

const CATEGORIES = ["Education", "Entrepreneurship", "Discipleship", "Community"];
const STATUSES = ["Active", "Completed", "Planned"] as const;

function ProjectModal({ project, onSave, onClose }: { project?: Project; onSave: (p: Omit<Project, "id">) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Project, "id">>(project ?? {
    title: "", category: "Education", status: "Active", desc: "", fullDesc: "", img: "", location: "", year: "", impact: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">{project ? "Edit Project" : "New Project"}</h3>
          <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project title" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Short Description</label>
            <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] resize-none" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Full Description</label>
            <textarea value={form.fullDesc} onChange={(e) => set("fullDesc", e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] resize-none" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Image URL</label>
            <input value={form.img} onChange={(e) => set("img", e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          {form.img && <img src={form.img} alt="Preview" className="w-full h-32 object-cover rounded-xl" />}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Year(s)</label>
              <input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024–2025" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Impact</label>
              <input value={form.impact} onChange={(e) => set("impact", e.target.value)} placeholder="200+ people" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted">Cancel</button>
          <motion.button whileHover={{ scale: saving ? 1 : 1.03 }} whileTap={{ scale: saving ? 1 : 0.97 }} disabled={saving}
            onClick={() => {
              void (async () => {
                setSaving(true);
                try {
                  await onSave(form);
                  onClose();
                } finally {
                  setSaving(false);
                }
              })();
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-70" style={{ backgroundColor: "#6E9277" }}>
            <Save size={13} /> {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = { Active: "#6E9277", Completed: "#474747", Planned: "#EAC79A" };

export default function AdminProjects() {
  const { projects, addProject, updateProject, deleteProject } = useSiteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} total · {projects.filter(p => p.status === "Active").length} active · shows on the Projects page</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
          <Plus size={15} /> New Project
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {projects.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-muted flex items-center gap-4 px-5 py-4 hover:shadow-sm">
              <img src={project.img} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{project.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: STATUS_COLORS[project.status] }}>{project.status}</span>
                  <span className="text-xs text-muted-foreground">{project.category} · {project.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditing(project); setShowModal(true); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Pencil size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { if (confirm("Delete project?")) deleteProject(project.id); }} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && <ProjectModal project={editing} onSave={async (f) => editing ? updateProject(editing.id, f) : addProject(f)} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
