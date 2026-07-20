"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
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
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

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
  const styles = useInlineFieldStyles();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [pending, setPending] = useState<
    null | { type: "delete" | "archive"; id: string; title: string }
  >(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  if (!canEdit) return <>{children}</>;

  const afterMutation = (next: Project[]) => {
    setProjects(next);
    setSavedNote("Saved to the live site.");
    setShowForm(false);
    setEditing(undefined);
    setPending(null);
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

  const runPending = async () => {
    if (!pending) return;
    setBusyId(pending.id);
    setError("");
    setSavedNote("");
    try {
      const next =
        pending.type === "delete"
          ? await deleteProjectAction(pending.id)
          : await archiveProjectAction(pending.id);
      afterMutation(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : pending.type === "delete"
            ? "Could not delete project."
            : "Could not archive project."
      );
      setPending(null);
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
        className="absolute top-3 right-3 z-40 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md opacity-90 hover:opacity-100"
        style={{ backgroundColor: styles.green }}
        title={`Edit ${title}`}
      >
        <Pencil size={12} /> Edit projects
      </button>

      {open ? (
        <InlineEditDrawer title={title} onClose={() => setOpen(false)}>
          <p className="text-xs" style={styles.help}>
            Upload a photo when you add or edit a project. Changes are saved to the database immediately.
          </p>

          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: styles.green }}
          >
            <Plus size={14} /> New project
          </button>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          {projects.length === 0 ? (
            <p className="text-sm text-center py-8" style={styles.help}>
              No projects yet. Add the first one.
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center gap-2 rounded-xl border p-3"
                  style={{ borderColor: styles.border }}
                >
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: styles.cardBg }}
                  >
                    {project.img ? (
                      <img src={project.img} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                      {project.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: styles.muted }}>
                      {project.status} · {project.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg"
                    style={{ color: styles.green }}
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
                      className="p-2 rounded-lg disabled:opacity-50"
                      style={{ color: styles.green }}
                      onClick={() =>
                        setPending({ type: "archive", id: project.id, title: project.title })
                      }
                      title="Archive (hide from public site)"
                    >
                      <Archive size={14} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === project.id}
                    className="p-2 rounded-lg text-red-500 disabled:opacity-50"
                    onClick={() =>
                      setPending({ type: "delete", id: project.id, title: project.title })
                    }
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </InlineEditDrawer>
      ) : null}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.type === "archive" ? "Archive project?" : "Delete project?"}
        message={
          pending?.type === "archive"
            ? `"${pending.title}" will be hidden from the public site. You can still find it in the admin list.`
            : `"${pending?.title ?? "This project"}" will be permanently removed from the live site.`
        }
        confirmLabel={pending?.type === "archive" ? "Archive" : "Delete"}
        danger={pending?.type === "delete"}
        busy={Boolean(busyId)}
        onCancel={() => setPending(null)}
        onConfirm={() => void runPending()}
      />

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
