"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, Save } from "lucide-react";

import type { Project } from "@/lib/site-content/types";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";

const CATEGORIES = ["Education", "Entrepreneurship", "Discipleship", "Community"];
const STATUSES = ["Active", "Completed", "Planned"] as const;

export type ProjectFormValues = Omit<Project, "id">;

const EMPTY_FORM: ProjectFormValues = {
  title: "",
  category: "Education",
  status: "Active",
  desc: "",
  fullDesc: "",
  img: "",
  location: "",
  year: "",
  impact: "",
};

export default function ProjectFormModal({
  project,
  onSave,
  onClose,
}: {
  project?: Project;
  onSave: (p: ProjectFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProjectFormValues>(
    project
      ? {
          title: project.title,
          category: project.category,
          status: project.status,
          desc: project.desc,
          fullDesc: project.fullDesc,
          img: project.img,
          location: project.location,
          year: project.year,
          impact: project.impact,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof ProjectFormValues, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Please add a project title.");
      return;
    }
    if (!form.img.trim()) {
      setError("Please upload a project photo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project.");
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
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">{project ? "Edit Project" : "New Project"}</h3>
          <button type="button" onClick={onClose}>
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Project title"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as Project["status"])}
                className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Short Description</label>
            <textarea
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] resize-none"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Full Description</label>
            <textarea
              value={form.fullDesc}
              onChange={(e) => set("fullDesc", e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] resize-none"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>

          <AdminImageUpload
            folder="projects"
            label="Project photo"
            onUploaded={({ publicUrl }) => set("img", publicUrl)}
          />
          {form.img ? (
            <img src={form.img} alt="Project preview" className="w-full h-40 object-cover rounded-xl" />
          ) : (
            <p className="text-xs text-muted-foreground">Upload a photo from your computer. URL paste is not needed.</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Location</label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Year(s)</label>
              <input
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                placeholder="2024–2025"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Impact</label>
              <input
                value={form.impact}
                onChange={(e) => set("impact", e.target.value)}
                placeholder="200+ people"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: saving ? 1 : 1.03 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-70"
            style={{ backgroundColor: "#6E9277" }}
          >
            <Save size={13} /> {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
