"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  deleteTeamMemberAction,
  saveTeamMemberAction,
  updateAboutAction,
} from "@/app/actions/site-content";
import type { AboutPageContent, AboutTeamMember } from "@/lib/site-content/types";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { useColors } from "@/site/lib/themeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

type FormValues = Omit<AboutTeamMember, "id">;

const EMPTY: FormValues = {
  name: "",
  role: "",
  bio: "",
  region: "",
  img: "",
  sortOrder: 0,
};

function PersonFormModal({
  person,
  onSave,
  onClose,
}: {
  person?: AboutTeamMember;
  onSave: (form: FormValues & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const c = useColors();
  const styles = useInlineFieldStyles();
  const [form, setForm] = useState<FormValues>(
    person
      ? {
          name: person.name,
          role: person.role,
          bio: person.bio,
          region: person.region,
          img: person.img,
          sortOrder: person.sortOrder,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormValues, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Please add a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(person ? { ...form, id: person.id } : form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
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
        className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: c.card, color: c.text, border: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <h3 className="text-base font-semibold" style={{ color: c.text }}>
            {person ? "Edit person" : "Add person"}
          </h3>
          <button type="button" onClick={onClose} style={{ color: c.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {(
            [
              ["name", "Name", false],
              ["role", "Role / title", false],
              ["region", "Region (e.g. DRC & USA)", false],
              ["bio", "Short bio", true],
            ] as const
          ).map(([key, label, multiline]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                {label}
              </span>
              {multiline ? (
                <textarea
                  rows={3}
                  value={String(form[key])}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
                  style={styles.input}
                />
              ) : (
                <input
                  value={String(form[key])}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  style={styles.input}
                />
              )}
            </label>
          ))}

          <AdminImageUpload
            folder="general"
            label="Photo"
            onUploaded={({ publicUrl }) => set("img", publicUrl)}
          />
          {form.img ? (
            <img src={form.img} alt="" className="w-24 h-24 rounded-full object-cover mx-auto" />
          ) : (
            <p className="text-xs" style={styles.help}>
              Optional: upload a photo. Until then, a default image may show.
            </p>
          )}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: `1px solid ${c.border}` }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ color: c.text, borderColor: c.border }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-70"
            style={{ backgroundColor: c.green }}
          >
            <Save size={13} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function InlineTeamEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const styles = useInlineFieldStyles();
  const [team, setTeam] = useState(about.team);
  const [headings, setHeadings] = useState({
    teamEyebrow: about.teamEyebrow,
    teamTitle: about.teamTitle,
    teamIntro: about.teamIntro,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AboutTeamMember | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingHeadings, setSavingHeadings] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AboutTeamMember | null>(null);

  useEffect(() => {
    setTeam([...about.team].sort((a, b) => a.sortOrder - b.sortOrder));
    setHeadings({
      teamEyebrow: about.teamEyebrow,
      teamTitle: about.teamTitle,
      teamIntro: about.teamIntro,
    });
  }, [about]);

  if (!canEdit) return <>{children}</>;

  const after = (nextAbout: AboutPageContent) => {
    setTeam([...nextAbout.team].sort((a, b) => a.sortOrder - b.sortOrder));
    setHeadings({
      teamEyebrow: nextAbout.teamEyebrow,
      teamTitle: nextAbout.teamTitle,
      teamIntro: nextAbout.teamIntro,
    });
    setSavedNote("Saved to the live site.");
    setShowForm(false);
    setEditing(undefined);
    router.refresh();
  };

  const saveHeadings = async () => {
    setSavingHeadings(true);
    setError("");
    try {
      after(await updateAboutAction(headings));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingHeadings(false);
    }
  };

  const save = async (form: FormValues & { id?: string }) => {
    setError("");
    setSavedNote("");
    const next = await saveTeamMemberAction(form);
    after(next);
  };

  const remove = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      const next = await deleteTeamMemberAction(id);
      setPendingDelete(null);
      after(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setPendingDelete(null);
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
        title="Edit team"
      >
        <Pencil size={12} /> Edit team
      </button>

      {open ? (
        <InlineEditDrawer title="Team & leadership" onClose={() => setOpen(false)}>
          <p className="text-xs font-semibold" style={styles.label}>
            Section headings
          </p>
          {(
            [
              ["teamEyebrow", "Eyebrow", false],
              ["teamTitle", "Title", false],
              ["teamIntro", "Intro", true],
            ] as const
          ).map(([key, label, multiline]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                {label}
              </span>
              {multiline ? (
                <textarea
                  rows={2}
                  value={headings[key]}
                  onChange={(e) => setHeadings((h) => ({ ...h, [key]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
                  style={styles.input}
                />
              ) : (
                <input
                  value={headings[key]}
                  onChange={(e) => setHeadings((h) => ({ ...h, [key]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  style={styles.input}
                />
              )}
            </label>
          ))}
          <button
            type="button"
            disabled={savingHeadings}
            onClick={() => void saveHeadings()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={14} /> {savingHeadings ? "Saving…" : "Save headings"}
          </button>

          <hr style={{ borderColor: styles.border }} />

          <p className="text-xs" style={styles.help}>
            Add, edit, or remove people. Changes save to the database right away.
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
            <Plus size={14} /> Add person
          </button>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          {team.length === 0 ? (
            <p className="text-sm text-center py-8" style={styles.help}>
              No people yet. Add the first team member.
            </p>
          ) : (
            <ul className="space-y-3">
              {team.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center gap-2 rounded-xl border p-3"
                  style={{ borderColor: styles.border }}
                >
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: styles.cardBg }}
                  >
                    {person.img ? (
                      <img src={person.img} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                      {person.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: styles.muted }}>
                      {person.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg"
                    style={{ color: styles.green }}
                    onClick={() => {
                      setEditing(person);
                      setShowForm(true);
                    }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === person.id}
                    className="p-2 rounded-lg text-red-500 disabled:opacity-50"
                    onClick={() => setPendingDelete(person)}
                    title="Delete"
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
        open={Boolean(pendingDelete)}
        title="Remove this person?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from the About page.`
            : "This person will be removed from the About page."
        }
        confirmLabel="Remove"
        danger
        busy={Boolean(busyId)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id);
        }}
      />

      <AnimatePresence>
        {showForm ? (
          <PersonFormModal
            person={editing}
            onSave={save}
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
