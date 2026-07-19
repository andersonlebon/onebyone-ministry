"use client";

import { useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence } from "motion/react";

import { updateProjectsAction } from "@/app/actions/site-content";
import type { Project } from "@/lib/site-content/types";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import ProjectFormModal, {
  type ProjectFormValues,
} from "@/site/app/components/admin/ProjectFormModal";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

/**
 * Admin-only control on public pages to add/edit/delete projects with photo upload.
 */
export function InlineProjectsEditor({
  children,
  title = "Projects",
}: {
  children: ReactNode;
  title?: string;
}) {
  const canEdit = useCanInlineEdit();
  const { projects } = useSiteContent();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!canEdit) return <>{children}</>;

  const persist = async (next: Project[]) => {
    await updateProjectsAction(next);
    window.location.reload();
  };

  const saveProject = async (form: ProjectFormValues) => {
    if (editing) {
      const next = projects.map((p) => (p.id === editing.id ? { ...p, ...form } : p));
      await persist(next);
      return;
    }
    await persist([{ ...form, id: uid() }, ...projects]);
  };

  const removeProject = async (id: string) => {
    if (!confirm("Delete this project from the live site?")) return;
    setBusyId(id);
    setError("");
    try {
      await persist(projects.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project.");
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
                Upload a photo from your computer when you add or edit a project. No image URL needed.
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

              {projects.length === 0 ? (
                <p className="text-sm text-[#6b7280] text-center py-8">No projects yet. Add the first one.</p>
              ) : (
                <ul className="space-y-3">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
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
                      <button
                        type="button"
                        disabled={busyId === project.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50"
                        onClick={() => void removeProject(project.id)}
                        title="Delete"
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
