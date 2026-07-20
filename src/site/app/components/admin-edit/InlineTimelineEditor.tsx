"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  deleteTimelineMilestoneAction,
  saveTimelineMilestoneAction,
  updateAboutAction,
} from "@/app/actions/site-content";
import type { AboutIconName, AboutPageContent, AboutTimelineMilestone } from "@/lib/site-content/types";
import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { useColors } from "@/site/lib/themeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

const ICONS: AboutIconName[] = ["Star", "Heart", "Globe", "Leaf", "BookOpen", "Users"];

type FormValues = Omit<AboutTimelineMilestone, "id">;

const EMPTY: FormValues = {
  year: "",
  title: "",
  desc: "",
  icon: "Star",
  color: "#6E9277",
  img: "",
  side: "left",
};

function MilestoneForm({
  milestone,
  onSave,
  onClose,
}: {
  milestone?: AboutTimelineMilestone;
  onSave: (form: FormValues & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const c = useColors();
  const styles = useInlineFieldStyles();
  const [form, setForm] = useState<FormValues>(
    milestone
      ? {
          year: milestone.year,
          title: milestone.title,
          desc: milestone.desc,
          icon: milestone.icon,
          color: milestone.color,
          img: milestone.img,
          side: milestone.side,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.year.trim() || !form.title.trim()) {
      setError("Year and title are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(milestone ? { ...form, id: milestone.id } : form);
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
            {milestone ? "Edit milestone" : "Add milestone"}
          </h3>
          <button type="button" onClick={onClose} style={{ color: c.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Year
              </span>
              <input
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                style={styles.input}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                Side
              </span>
              <select
                value={form.side}
                onChange={(e) => set("side", e.target.value as "left" | "right")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                style={styles.input}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>
          </div>
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
                onChange={(e) => set("icon", e.target.value as AboutIconName)}
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
            label="Milestone photo"
            onUploaded={({ publicUrl }) => set("img", publicUrl)}
          />
          {form.img ? (
            <img src={form.img} alt="" className="w-full h-32 object-cover rounded-xl" />
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

export function InlineTimelineEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const styles = useInlineFieldStyles();
  const [timeline, setTimeline] = useState(about.timeline);
  const [header, setHeader] = useState({
    timelineEyebrow: about.timelineEyebrow,
    timelineTitle: about.timelineTitle,
    timelineIntro: about.timelineIntro,
    timelineFruitLabel: about.timelineFruitLabel,
    timelineFruitTitle: about.timelineFruitTitle,
    timelineFruitSub: about.timelineFruitSub,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AboutTimelineMilestone | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingHeader, setSavingHeader] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AboutTimelineMilestone | null>(null);

  useEffect(() => {
    setTimeline(about.timeline);
    setHeader({
      timelineEyebrow: about.timelineEyebrow,
      timelineTitle: about.timelineTitle,
      timelineIntro: about.timelineIntro,
      timelineFruitLabel: about.timelineFruitLabel,
      timelineFruitTitle: about.timelineFruitTitle,
      timelineFruitSub: about.timelineFruitSub,
    });
  }, [about]);

  if (!canEdit) return <>{children}</>;

  const after = (next: AboutPageContent) => {
    setTimeline(next.timeline);
    setSavedNote("Saved to the live site.");
    setShowForm(false);
    setEditing(undefined);
    router.refresh();
  };

  const saveMilestone = async (form: FormValues & { id?: string }) => {
    setError("");
    setSavedNote("");
    after(await saveTimelineMilestoneAction(form));
  };

  const remove = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      after(await deleteTimelineMilestoneAction(id));
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setPendingDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  const saveHeader = async () => {
    setSavingHeader(true);
    setError("");
    try {
      after(await updateAboutAction(header));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingHeader(false);
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
        title="Edit founders journey"
      >
        <Pencil size={12} /> Edit journey
      </button>

      {open ? (
        <InlineEditDrawer title="Founders' journey" onClose={() => setOpen(false)}>
          <p className="text-xs font-semibold" style={styles.label}>
            Section headings
          </p>
          {(
            [
              ["timelineEyebrow", "Eyebrow", false],
              ["timelineTitle", "Title", false],
              ["timelineIntro", "Intro", true],
              ["timelineFruitLabel", "Fruit label", false],
              ["timelineFruitTitle", "Fruit title", false],
              ["timelineFruitSub", "Fruit subtitle", true],
            ] as const
          ).map(([key, label, multiline]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                {label}
              </span>
              {multiline ? (
                <textarea
                  rows={2}
                  value={header[key]}
                  onChange={(e) => setHeader((h) => ({ ...h, [key]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
                  style={styles.input}
                />
              ) : (
                <input
                  value={header[key]}
                  onChange={(e) => setHeader((h) => ({ ...h, [key]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  style={styles.input}
                />
              )}
            </label>
          ))}
          <button
            type="button"
            disabled={savingHeader}
            onClick={() => void saveHeader()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: styles.green }}
          >
            <Save size={14} /> {savingHeader ? "Saving…" : "Save headings"}
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
            <Plus size={14} /> Add milestone
          </button>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          <ul className="space-y-3">
            {timeline.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-xl border p-3"
                style={{ borderColor: styles.border }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: styles.text }}>
                    {m.year}: {m.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: styles.muted }}>
                    {m.side} · {m.icon}
                  </p>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-lg"
                  style={{ color: styles.green }}
                  onClick={() => {
                    setEditing(m);
                    setShowForm(true);
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  disabled={busyId === m.id}
                  className="p-2 rounded-lg text-red-500 disabled:opacity-50"
                  onClick={() => setPendingDelete(m)}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </InlineEditDrawer>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove milestone?"
        message={
          pendingDelete
            ? `"${pendingDelete.year}: ${pendingDelete.title}" will be removed from the founders journey.`
            : "This milestone will be removed."
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
          <MilestoneForm
            milestone={editing}
            onSave={saveMilestone}
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
