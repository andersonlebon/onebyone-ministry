"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  deleteAboutPersonAction,
  saveAboutPersonAction,
  updateAboutAction,
} from "@/app/actions/site-content";
import type {
  AboutPageContent,
  AboutPeopleListKey,
  AboutPerson,
  AboutSocialLink,
  AboutSocialPlatform,
} from "@/lib/site-content/types";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { useColors } from "@/site/lib/themeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

const PLATFORMS: AboutSocialPlatform[] = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
  "website",
];

type FormValues = Omit<AboutPerson, "id">;

const EMPTY: FormValues = {
  name: "",
  role: "",
  bio: "",
  img: "",
  socialLinks: [],
  sortOrder: 0,
};

const LIST_META: Record<
  AboutPeopleListKey,
  {
    buttonLabel: string;
    drawerTitle: string;
    eyebrowKey: "foundersEyebrow" | "leadershipEyebrow" | "teamEyebrow";
    titleKey: "foundersTitle" | "leadershipTitle" | "teamTitle";
    introKey: "foundersIntro" | "leadershipIntro" | "teamIntro";
  }
> = {
  founders: {
    buttonLabel: "Edit founders",
    drawerTitle: "Founders",
    eyebrowKey: "foundersEyebrow",
    titleKey: "foundersTitle",
    introKey: "foundersIntro",
  },
  leadership: {
    buttonLabel: "Edit leadership",
    drawerTitle: "Leadership",
    eyebrowKey: "leadershipEyebrow",
    titleKey: "leadershipTitle",
    introKey: "leadershipIntro",
  },
  team: {
    buttonLabel: "Edit team",
    drawerTitle: "Team Members",
    eyebrowKey: "teamEyebrow",
    titleKey: "teamTitle",
    introKey: "teamIntro",
  },
};

function PersonFormModal({
  person,
  onSave,
  onClose,
}: {
  person?: AboutPerson;
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
          img: person.img,
          socialLinks: person.socialLinks?.length
            ? person.socialLinks.map((s) => ({ ...s }))
            : [],
          sortOrder: person.sortOrder,
        }
      : { ...EMPTY, socialLinks: [] }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormValues, v: string | number | AboutSocialLink[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updateSocial = (index: number, patch: Partial<AboutSocialLink>) => {
    setForm((f) => ({
      ...f,
      socialLinks: f.socialLinks.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Please add a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...(person ? { id: person.id } : {}),
        ...form,
        socialLinks: form.socialLinks.filter((s) => s.url.trim()),
      });
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
        className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: c.card, color: c.text, border: `1px solid ${c.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <h3 className="text-base font-semibold">{person ? "Edit person" : "Add person"}</h3>
          <button type="button" onClick={onClose} style={{ color: c.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <AdminImageUpload
            folder="general"
            onUploaded={({ publicUrl }) => set("img", publicUrl)}
          />
          {form.img ? (
            <img src={form.img} alt="" className="w-full h-40 object-cover rounded-xl" />
          ) : null}
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Name
            </span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Job title / profession
            </span>
            <input
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Description
            </span>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
              style={styles.input}
            />
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={styles.label}>
                Social links
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    socialLinks: [
                      ...f.socialLinks,
                      {
                        id:
                          typeof crypto !== "undefined" && "randomUUID" in crypto
                            ? crypto.randomUUID()
                            : `social-${Date.now()}`,
                        platform: "website",
                        url: "",
                      },
                    ],
                  }))
                }
                className="text-xs font-semibold"
                style={{ color: styles.green }}
              >
                + Add link
              </button>
            </div>
            <div className="space-y-2">
              {form.socialLinks.map((link, index) => (
                <div key={link.id} className="flex gap-2 items-center">
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocial(index, { platform: e.target.value as AboutSocialPlatform })
                    }
                    className="rounded-xl border px-2 py-2 text-xs focus:outline-none"
                    style={styles.input}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    value={link.url}
                    onChange={(e) => updateSocial(index, { url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    className="p-2 text-red-500"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        socialLinks: f.socialLinks.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
        <div
          className="px-6 py-4 flex gap-3 justify-end"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: c.border, color: c.text }}
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

export function InlinePeopleEditor({
  list,
  children,
}: {
  list: AboutPeopleListKey;
  children: ReactNode;
}) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const styles = useInlineFieldStyles();
  const meta = LIST_META[list];

  const [people, setPeople] = useState(() =>
    [...about[list]].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [headings, setHeadings] = useState({
    eyebrow: about[meta.eyebrowKey],
    title: about[meta.titleKey],
    intro: about[meta.introKey],
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AboutPerson | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingHeadings, setSavingHeadings] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AboutPerson | null>(null);

  useEffect(() => {
    setPeople([...about[list]].sort((a, b) => a.sortOrder - b.sortOrder));
    setHeadings({
      eyebrow: about[meta.eyebrowKey],
      title: about[meta.titleKey],
      intro: about[meta.introKey],
    });
  }, [about, list, meta.eyebrowKey, meta.titleKey, meta.introKey]);

  if (!canEdit) return <>{children}</>;

  const after = (nextAbout: AboutPageContent) => {
    setPeople([...nextAbout[list]].sort((a, b) => a.sortOrder - b.sortOrder));
    setHeadings({
      eyebrow: nextAbout[meta.eyebrowKey],
      title: nextAbout[meta.titleKey],
      intro: nextAbout[meta.introKey],
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
      after(
        await updateAboutAction({
          [meta.eyebrowKey]: headings.eyebrow,
          [meta.titleKey]: headings.title,
          [meta.introKey]: headings.intro,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingHeadings(false);
    }
  };

  const save = async (form: FormValues & { id?: string }) => {
    setError("");
    setSavedNote("");
    after(await saveAboutPersonAction(list, form));
  };

  const remove = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      const next = await deleteAboutPersonAction(list, id);
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
        title={meta.buttonLabel}
      >
        <Pencil size={12} /> {meta.buttonLabel}
      </button>

      {open ? (
        <InlineEditDrawer title={meta.drawerTitle} onClose={() => setOpen(false)}>
          <p className="text-xs font-semibold" style={styles.label}>
            Section headings
          </p>
          {(
            [
              ["eyebrow", "Eyebrow", false],
              ["title", "Title", false],
              ["intro", "Intro", true],
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

          {people.length === 0 ? (
            <p className="text-sm text-center py-8" style={styles.help}>
              No people yet. Add the first person.
            </p>
          ) : (
            <ul className="space-y-3">
              {people.map((person) => (
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
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === person.id}
                    className="p-2 rounded-lg text-red-500 disabled:opacity-50"
                    onClick={() => setPendingDelete(person)}
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

/** @deprecated Use InlinePeopleEditor with list="team" */
export function InlineTeamEditor({ children }: { children: ReactNode }) {
  return <InlinePeopleEditor list="team">{children}</InlinePeopleEditor>;
}
