"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Archive, Plus, Pencil, Trash2 } from "lucide-react";

import {
  archiveProjectAction,
  deleteProjectAction,
  saveProjectAction,
} from "@/app/actions/site-content";
import type { Project } from "@/lib/site-content/types";
import ProjectFormModal from "@/site/app/components/admin/ProjectFormModal";
import { ConfirmDialog } from "@/site/app/components/admin-edit/ConfirmDialog";
import { useSiteStore } from "@/site/lib/siteStore";

const STATUS_COLORS: Record<string, string> = {
  Active: "#6E9277",
  Completed: "#474747",
  Planned: "#EAC79A",
  Archived: "#9ca3af",
};

export default function AdminProjects() {
  const router = useRouter();
  const { projects: storeProjects } = useSiteStore();
  const [projects, setProjects] = useState<Project[]>(storeProjects);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState<null | { type: "delete" | "archive"; project: Project }>(
    null
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProjects(storeProjects);
  }, [storeProjects]);

  const refresh = () => router.refresh();

  const runPending = async () => {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      const next =
        pending.type === "delete"
          ? await deleteProjectAction(pending.project.id)
          : await archiveProjectAction(pending.project.id);
      setProjects(next);
      setPending(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project.");
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} total · {projects.filter((p) => p.status === "Active").length} active ·
            upload a photo for each project. Archive hides from the public site; delete removes permanently.
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

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

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
                    style={{ backgroundColor: STATUS_COLORS[project.status] ?? "#6E9277" }}
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
                  title="Edit"
                >
                  <Pencil size={14} />
                </motion.button>
                {project.status !== "Archived" ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setPending({ type: "archive", project })}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                    title="Archive"
                  >
                    <Archive size={14} />
                  </motion.button>
                ) : null}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setPending({ type: "delete", project })}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                  title="Delete permanently"
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

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.type === "archive" ? "Archive project?" : "Delete project?"}
        message={
          pending?.type === "archive"
            ? `"${pending.project.title}" will be hidden from the public site.`
            : `"${pending?.project.title ?? "This project"}" will be permanently removed.`
        }
        confirmLabel={pending?.type === "archive" ? "Archive" : "Delete"}
        danger={pending?.type === "delete"}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void runPending()}
      />

      <AnimatePresence>
        {showModal ? (
          <ProjectFormModal
            project={editing}
            onSave={async (f) => {
              setError("");
              const next = await saveProjectAction(editing ? { ...f, id: editing.id } : f);
              setProjects(next);
              refresh();
            }}
            onClose={() => setShowModal(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
