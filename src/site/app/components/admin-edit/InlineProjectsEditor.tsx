"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence } from "motion/react";

import {
  archiveProjectAction,
  deleteProjectAction,
  saveProjectAction,
} from "@/app/actions/site-content";
import type { Project } from "@/lib/site-content/types";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import ProjectFormModal, {
  type ProjectFormValues,
} from "@/site/app/components/admin/ProjectFormModal";

/**
 * Admin-only control on public pages to add/edit/archive/delete projects with photo upload.
 * Mutations always read-merge-write against the database so saves persist after refresh.
 */
export function InlineProjectsEditor({
  children,
  title = "Projects",
}: {
  children: ReactNode;
  title?: string;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { projects: initialProjects } = useSiteContent();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  if (!canEdit) return <>{children}</>;

  const afterMutation = (next: Project[]) => {
    setProjects(next);
    setSavedNote("Saved to the live site.");
    setShowForm(false);
    setEditing(undefined);
    router.refresh();
  };

  const saveProject = async (form: ProjectFormValues) => {
    setError("");
    setSavedNote("");
    const next = await saveProjectAction(
      editing ? { ...form, id: editing.id } : form
    );
    afterMutation(next);
  };

  const removeProject = async (id: string) => {
    if (!confirm("Permanently delete this project from the live site?")) return;
    setBusyId(id);
    setError("");
    setSavedNote("");
    try {
      const next = await deleteProjectAction(id);
      afterMutation(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project.");
    } finally {
      setBusyId(null);
    }
  };

  const archiveProject = async (id: string) => {
    if (!confirm("Archive this project? It will be hidden from the public site.")) return;
    setBusyId(id);
    setError("");
    setSavedNote("");
    try {
      const next = await archiveProjectAction(id);
      afterMutation(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not archive project.");
    } finally {
      setBusyId(null);
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
        className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100"
        style={{ backgroundColor: "#6E9277" }}
        title={`Edit ${title}`}
      >
        <Pencil size={12} /> Edit projects
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#6E9277]">Edit on this page</p>
                <h3 className="text-base font-semibold text-[#474747]">{title}</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-[#474747]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#6b7280]">
                Upload a photo when you add or edit a project. Changes are saved to the database immediately.
              </p>

              <button
                type="button"
                onClick={() => {
                  setEditing(undefined);
                  setShowForm(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#6E9277" }}
              >
                <Plus size={14} /> New project
              </button>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {savedNote ? <p className="text-sm text-[#6E9277]">{savedNote}</p> : null}

              {projects.length === 0 ? (
                <p className="text-sm text-[#6b7280] text-center py-8">No projects yet. Add the first one.</p>
              ) : (
                <ul className="space-y-3">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center gap-2 rounded-xl border p-3"
                      style={{ borderColor: "rgba(110,146,119,0.25)" }}
                    >
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "#EFE7DB" }}
                      >
                        {project.img ? (
                          <img src={project.img} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#474747] truncate">{project.title}</p>
                        <p className="text-xs text-[#6b7280] truncate">
                          {project.status} · {project.category}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-[#EFE7DB] text-[#6E9277]"
                        onClick={() => {
                          setEditing(project);
                          setShowForm(true);
                        }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {project.status !== "Archived" ? (
                        <button
                          type="button"
                          disabled={busyId === project.id}
                          className="p-2 rounded-lg hover:bg-[#EFE7DB] text-[#6E9277] disabled:opacity-50"
                          onClick={() => void archiveProject(project.id)}
                          title="Archive (hide from public site)"
                        >
                          <Archive size={14} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busyId === project.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50"
                        onClick={() => void removeProject(project.id)}
                        title="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showForm ? (
          <ProjectFormModal
            project={editing}
            onSave={saveProject}
            onClose={() => {
              setShowForm(false);
              setEditing(undefined);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
