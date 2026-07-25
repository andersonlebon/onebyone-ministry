"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  saveHomePillarAction,
  updateHomePillarsHeadingAction,
} from "@/app/actions/site-media";
import type { HomePillar, HomePillarIcon } from "@/lib/media/types";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteMedia } from "@/site/lib/mediaContext";
import { useColors } from "@/site/lib/themeStore";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

const ICONS: HomePillarIcon[] = ["BookOpen", "Lightbulb", "Heart", "Users"];

function PillarFormModal({
  pillar,
  onSave,
  onClose,
}: {
  pillar: HomePillar;
  onSave: (form: HomePillar) => Promise<void>;
  onClose: () => void;
}) {
  const c = useColors();
  const styles = useInlineFieldStyles();
  const [form, setForm] = useState<HomePillar>({ ...pillar });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof HomePillar>(key: K, value: HomePillar[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Please add a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
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
            Edit pillar
          </h3>
          <button type="button" onClick={onClose} style={{ color: c.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Title
            </span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
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
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
              style={styles.input}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Icon
              </span>
              <select
                value={form.icon}
                onChange={(e) => set("icon", e.target.value as HomePillarIcon)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                style={styles.input}
              >
                {ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Accent color
              </span>
              <input
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                style={styles.input}
              />
            </label>
          </div>

          <AdminImageUpload
            folder="general"
            label="Pillar photo"
            onUploaded={({ publicUrl }) => set("img", publicUrl)}
          />
          {form.img ? (
            <img src={form.img} alt="" className="w-full h-36 object-cover rounded-xl" />
          ) : null}

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

export function InlinePillarsEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const media = useSiteMedia();
  const styles = useInlineFieldStyles();
  const [pillars, setPillars] = useState(media.homePillars);
  const [heading, setHeading] = useState(media.homePillarsHeading);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HomePillar | undefined>();
  const [savingHeading, setSavingHeading] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => {
    setPillars(media.homePillars);
    setHeading(media.homePillarsHeading);
  }, [media.homePillars, media.homePillarsHeading]);

  if (!canEdit) return <>{children}</>;

  const after = (next: { homePillars: readonly HomePillar[]; homePillarsHeading: typeof heading }) => {
    setPillars(next.homePillars);
    setHeading(next.homePillarsHeading);
    setSavedNote("Saved to the live site.");
    setEditing(undefined);
    router.refresh();
  };

  const saveHeading = async () => {
    setSavingHeading(true);
    setError("");
    try {
      after(await updateHomePillarsHeadingAction(heading));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingHeading(false);
    }
  };

  const savePillar = async (form: HomePillar) => {
    setError("");
    setSavedNote("");
    after(await saveHomePillarAction(form));
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
        title="Edit pillars"
      >
        <Pencil size={12} /> Edit pillars
      </button>

      {open ? (
        <InlineEditDrawer title="Four pillars" onClose={() => setOpen(false)}>
          <p className="text-xs font-semibold" style={styles.label}>
            Section headings
          </p>
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Eyebrow
            </span>
            <input
              value={heading.eyebrow}
              onChange={(e) => setHeading((h) => ({ ...h, eyebrow: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
              Title
            </span>
            <input
              value={heading.title}
              onChange={(e) => setHeading((h) => ({ ...h, title: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              style={styles.input}
            />
          </label>
          <button
            type="button"
            disabled={savingHeading}
            onClick={() => void saveHeading()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={14} /> {savingHeading ? "Saving…" : "Save headings"}
          </button>

          <hr style={{ borderColor: styles.border }} />

          <p className="text-xs" style={styles.help}>
            Edit each pillar’s photo and text. Changes save to the database right away.
          </p>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          <ul className="space-y-3">
            {pillars.map((pillar) => (
              <li
                key={pillar.key}
                className="flex items-center gap-2 rounded-xl border p-3"
                style={{ borderColor: styles.border }}
              >
                <div
                  className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: styles.cardBg }}
                >
                  {pillar.img ? (
                    <img src={pillar.img} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                    {pillar.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: styles.muted }}>
                    {pillar.desc}
                  </p>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-lg"
                  style={{ color: styles.green }}
                  onClick={() => setEditing(pillar)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
              </li>
            ))}
          </ul>
        </InlineEditDrawer>
      ) : null}

      <AnimatePresence>
        {editing ? (
          <PillarFormModal
            pillar={editing}
            onSave={savePillar}
            onClose={() => setEditing(undefined)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
