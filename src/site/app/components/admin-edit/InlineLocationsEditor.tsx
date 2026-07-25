"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save } from "lucide-react";

import {
  saveAboutLocationAction,
  updateAboutAction,
} from "@/app/actions/site-content";
import type { AboutLocation, AboutPageContent } from "@/lib/site-content/types";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { InlineEditDrawer, useInlineFieldStyles } from "./InlineEditDrawer";

export function InlineLocationsEditor({ children }: { children: ReactNode }) {
  const canEdit = useCanInlineEdit();
  const router = useRouter();
  const { about } = useSiteContent();
  const styles = useInlineFieldStyles();

  const [open, setOpen] = useState(false);
  const [headings, setHeadings] = useState({
    locationsEyebrow: about.locationsEyebrow,
    locationsTitle: about.locationsTitle,
    locationsIntro: about.locationsIntro,
  });
  const [locations, setLocations] = useState<AboutLocation[]>(() =>
    about.locations.map((l) => ({ ...l }))
  );
  const [savingHeadings, setSavingHeadings] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => {
    setHeadings({
      locationsEyebrow: about.locationsEyebrow,
      locationsTitle: about.locationsTitle,
      locationsIntro: about.locationsIntro,
    });
    setLocations(about.locations.map((l) => ({ ...l })));
  }, [about]);

  if (!canEdit) return <>{children}</>;

  const after = (next: AboutPageContent) => {
    setHeadings({
      locationsEyebrow: next.locationsEyebrow,
      locationsTitle: next.locationsTitle,
      locationsIntro: next.locationsIntro,
    });
    setLocations(next.locations.map((l) => ({ ...l })));
    setSavedNote("Saved to the live site.");
    router.refresh();
  };

  const saveHeadings = async () => {
    setSavingHeadings(true);
    setError("");
    try {
      after(await updateAboutAction(headings));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save headings.");
    } finally {
      setSavingHeadings(false);
    }
  };

  const saveLocation = async (loc: AboutLocation) => {
    setBusyId(loc.id);
    setError("");
    try {
      after(await saveAboutLocationAction(loc));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save location.");
    } finally {
      setBusyId(null);
    }
  };

  const updateDraft = (id: string, patch: Partial<AboutLocation>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
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
        title="Edit locations"
      >
        <Pencil size={12} /> Edit locations
      </button>

      {open ? (
        <InlineEditDrawer title="Locations" onClose={() => setOpen(false)}>
          <p className="text-xs" style={styles.help}>
            Set section copy and map coordinates (latitude / longitude) for Congo and the USA.
          </p>

          {(
            [
              ["locationsEyebrow", "Eyebrow"],
              ["locationsTitle", "Title"],
              ["locationsIntro", "Intro"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                {label}
              </span>
              {key === "locationsIntro" ? (
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

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {savedNote ? (
            <p className="text-sm" style={{ color: styles.green }}>
              {savedNote}
            </p>
          ) : null}

          <ul className="space-y-5">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: styles.border }}
              >
                <p className="text-sm font-semibold" style={{ color: styles.text }}>
                  {loc.label || "Location"}
                </p>
                <label className="block">
                  <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                    Label
                  </span>
                  <input
                    value={loc.label}
                    onChange={(e) => updateDraft(loc.id, { label: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    style={styles.input}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                    Description
                  </span>
                  <textarea
                    rows={2}
                    value={loc.description}
                    onChange={(e) => updateDraft(loc.id, { description: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
                    style={styles.input}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                      Latitude
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={loc.lat}
                      onChange={(e) =>
                        updateDraft(loc.id, { lat: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                      style={styles.input}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold mb-1.5" style={styles.label}>
                      Longitude
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={loc.lng}
                      onChange={(e) =>
                        updateDraft(loc.id, { lng: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                      style={styles.input}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={busyId === loc.id}
                  onClick={() => void saveLocation(loc)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: styles.green }}
                >
                  <Save size={14} />
                  {busyId === loc.id ? "Saving…" : "Save place"}
                </button>
              </li>
            ))}
          </ul>
        </InlineEditDrawer>
      ) : null}
    </div>
  );
}
