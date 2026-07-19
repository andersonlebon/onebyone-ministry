"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import ProjectFormModal from "@/site/app/components/admin/ProjectFormModal";
import { useSiteStore, Project } from "@/site/lib/siteStore";

const STATUS_COLORS: Record<string, string> = {
  Active: "#6E9277",
  Completed: "#474747",
  Planned: "#EAC79A",
};

export default function AdminProjects() {
  const { projects, addProject, updateProject, deleteProject } = useSiteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} total · {projects.filter((p) => p.status === "Active").length} active ·
            upload a photo for each project (no URL needed)
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
          <Plus size={15} /> New Project
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-muted flex items-center gap-4 px-5 py-4 hover:shadow-sm"
            >
              <img
                src={project.img}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-muted"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{project.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                    style={{ backgroundColor: STATUS_COLORS[project.status] }}
                  >
                    {project.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {project.category} · {project.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setEditing(project);
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <Pencil size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    if (confirm("Delete project?")) void deleteProject(project.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No projects yet. Click New Project and upload a photo from your computer.
        </p>
      ) : null}

      <AnimatePresence>
        {showModal ? (
          <ProjectFormModal
            project={editing}
            onSave={async (f) => (editing ? updateProject(editing.id, f) : addProject(f))}
            onClose={() => setShowModal(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
