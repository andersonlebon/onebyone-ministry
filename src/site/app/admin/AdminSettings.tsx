"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Save, CheckCircle2, AlertCircle, ExternalLink, Eye, X } from "lucide-react";
import { updateSiteMediaSlotAction, type SiteMediaSlotPath } from "@/app/actions/site-media";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { MediaFolder } from "@/lib/db/schema";
import { useSiteMedia } from "@/site/lib/mediaContext";
import AdminMediaSlotField from "@/site/app/components/admin/AdminMediaSlotField";
import AdminSettingsPreview, { SECTION_LABELS, type SettingsPreviewSection } from "@/site/app/admin/AdminSettingsPreview";
import { defaultSiteSettings } from "@/content/site-defaults";
import {
  getHeroHeadlineLines,
  normalizeHeroHeadlineLines,
  syncHeroHeadlineFromLines,
} from "@/lib/site-content/hero-headline";
import { useSiteStore, SiteSettings } from "@/site/lib/siteStore";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import { HeroHeadlineLinesFields } from "@/site/app/components/admin-edit/HeroHeadlineLinesFields";

type MediaSlotConfig = {
  id: string;
  label: string;
  previewLabel: string;
  viewUrl: string;
  folder: MediaFolder;
  path: SiteMediaSlotPath;
  getValue: (media: SiteMediaBundle) => string;
  applyValue: (media: SiteMediaBundle, url: string) => SiteMediaBundle;
};

const MEDIA_SLOTS: MediaSlotConfig[] = [
  {
    id: "hero",
    label: "Home page top image",
    previewLabel: "Background image at the top of the Home page (/).",
    viewUrl: "/",
    folder: "general",
    path: ["websiteUseImages", "hero"],
    getValue: (m) => m.websiteUseImages.hero,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, hero: url } }),
  },
  {
    id: "about",
    label: "About page top image",
    previewLabel: "Top banner on the About page (/about).",
    viewUrl: "/about",
    folder: "general",
    path: ["websiteUseImages", "about"],
    getValue: (m) => m.websiteUseImages.about,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, about: url } }),
  },
  {
    id: "projects",
    label: "Projects page top image",
    previewLabel: "Top banner on the Projects page (/projects).",
    viewUrl: "/projects",
    folder: "general",
    path: ["websiteUseImages", "projects"],
    getValue: (m) => m.websiteUseImages.projects,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, projects: url } }),
  },
  {
    id: "photos",
    label: "Photos page top image",
    previewLabel: "Top banner on the Photos page (/photos). Gallery photos are managed in Photo Library.",
    viewUrl: "/photos",
    folder: "general",
    path: ["websiteUseImages", "community"],
    getValue: (m) => m.websiteUseImages.community,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, community: url } }),
  },
  {
    id: "videos",
    label: "Videos page top image",
    previewLabel: "Top banner on the Videos page (/videos).",
    viewUrl: "/videos",
    folder: "general",
    path: ["websiteUseImages", "outreach"],
    getValue: (m) => m.websiteUseImages.outreach,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, outreach: url } }),
  },
  {
    id: "contactHero",
    label: "Contact page top image",
    previewLabel: "Top banner on the Contact page (/contact).",
    viewUrl: "/contact",
    folder: "general",
    path: ["localImages", "contactHero"],
    getValue: (m) => m.localImages.contactHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, contactHero: url } }),
  },
  {
    id: "donateHero",
    label: "Donate page top image",
    previewLabel: "Top banner on the Donate page (/donate).",
    viewUrl: "/donate",
    folder: "general",
    path: ["localImages", "donateHero"],
    getValue: (m) => m.localImages.donateHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, donateHero: url } }),
  },
  {
    id: "storyHero",
    label: "Stories page top image",
    previewLabel: "Top banner on the Stories page (/stories).",
    viewUrl: "/stories",
    folder: "general",
    path: ["localImages", "storyHero"],
    getValue: (m) => m.localImages.storyHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, storyHero: url } }),
  },
];

function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  const fieldId = useId();
  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea id={fieldId} value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6E9277] resize-none"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      ) : (
        <input id={fieldId} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      )}
    </div>
  );
}

function SectionCard({
  title,
  section,
  activeSection,
  onActivate,
  children,
}: {
  title: string;
  section: SettingsPreviewSection;
  activeSection: SettingsPreviewSection;
  onActivate: (section: SettingsPreviewSection) => void;
  children: React.ReactNode;
}) {
  const isActive = activeSection === section;

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${isActive ? "border-[#6E9277]/50 bg-[#6E9277]/5" : "border-muted bg-card"}`}
      onMouseEnter={() => onActivate(section)}
      onFocusCapture={() => onActivate(section)}
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const router = useRouter();
  const siteMedia = useSiteMedia();
  const { settings, updateSettings } = useSiteStore();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [mediaForm, setMediaForm] = useState<SiteMediaBundle>(siteMedia);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [liveSiteUrl, setLiveSiteUrl] = useState<string | null>(null);
  const [savingMediaSlot, setSavingMediaSlot] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SettingsPreviewSection>("homepage");
  const [activeImageSlot, setActiveImageSlot] = useState<MediaSlotConfig>(MEDIA_SLOTS[0]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const merged = { ...defaultSiteSettings, ...settings } as SiteSettings;
    const lines = getHeroHeadlineLines(merged);
    setForm({
      ...merged,
      heroHeadlineLines: lines,
      heroHeadline: syncHeroHeadlineFromLines(lines) || merged.heroHeadline,
    });
  }, [settings]);

  useEffect(() => {
    if (savingMediaSlot) return;
    setMediaForm(siteMedia);
  }, [siteMedia, savingMediaSlot]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewOpen]);

  const set = (k: keyof SiteSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(settings),
    [form, settings]
  );

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const lines = normalizeHeroHeadlineLines(form.heroHeadlineLines);
      await updateSettings({
        ...form,
        heroHeadlineLines: lines,
        heroHeadline: syncHeroHeadlineFromLines(lines),
      });
      setSaved(true);
      setLiveSiteUrl(`/?v=${Date.now()}`);
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (slot: MediaSlotConfig, publicUrl: string) => {
    const next = slot.applyValue(mediaForm, publicUrl);
    setMediaForm(next);
    setActiveSection("images");
    setActiveImageSlot(slot);
    setSavingMediaSlot(slot.id);
    setSaveError("");

    try {
      const savedBundle = await updateSiteMediaSlotAction(slot.path, publicUrl);
      setMediaForm(savedBundle);
      setLiveSiteUrl(`${slot.viewUrl}?v=${Date.now()}`);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Image upload failed to sync to the live site.");
    } finally {
      setSavingMediaSlot(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Edit homepage text, contact details, social links, and each page&apos;s top banner image.
            Text needs Save Changes. Banner uploads save automatically. Gallery photos are in Photo Library.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isDirty && (
            <p className="text-xs font-medium text-amber-700">Unsaved text changes</p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6E9277] border transition-colors hover:bg-[#6E9277]/10"
              style={{ borderColor: "rgba(110,146,119,0.4)" }}
            >
              <Eye size={15} />
              Preview this section
            </motion.button>
            <motion.button
              whileHover={{ scale: saving ? 1 : 1.03 }}
              whileTap={{ scale: saving ? 1 : 0.97 }}
              onClick={() => void handleSave()}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{
                backgroundColor: saved ? "#5a7d64" : isDirty ? "#6E9277" : "#9ca3af",
              }}
            >
              {saved ? <><CheckCircle2 size={15} /> Saved!</> : saving ? "Saving..." : <><Save size={15} /> Save Changes</>}
            </motion.button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Previewing: {SECTION_LABELS[activeSection]}
          </p>
        </div>
      </div>

      {isDirty && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            You have unsaved text changes. The preview shows your draft, not the live website.
            Click <strong>Save Changes</strong> to publish updates.
          </p>
        </div>
      )}

      {(saved || liveSiteUrl) && liveSiteUrl && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#6E9277]/30 bg-[#6E9277]/10 px-4 py-3 text-sm text-foreground">
          <p>{saved ? "Settings saved to the live website." : "Banner image saved. Open the page to confirm (refresh if needed)."}</p>
          <a
            href={liveSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#6E9277] hover:underline"
          >
            View that page <ExternalLink size={14} />
          </a>
        </div>
      )}

      {saveError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
          <SectionCard title="Homepage Content" section="homepage" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <HeroHeadlineLinesFields
                lines={form.heroHeadlineLines?.length ? form.heroHeadlineLines : getHeroHeadlineLines(form)}
                onChange={(lines) =>
                  setForm((f) => ({
                    ...f,
                    heroHeadlineLines: lines,
                    heroHeadline: syncHeroHeadlineFromLines(normalizeHeroHeadlineLines(lines)),
                  }))
                }
                styles={{
                  label: { color: "inherit" },
                  help: { color: "var(--muted-foreground, #7a7068)" },
                  input: {
                    backgroundColor: "var(--card, #fff)",
                    color: "inherit",
                    borderColor: "rgba(110,146,119,0.3)",
                  },
                  border: "rgba(110,146,119,0.28)",
                  text: "inherit",
                  muted: "#7a7068",
                  green: "#6E9277",
                  cardBg: "rgba(110,146,119,0.04)",
                }}
              />
              <Field label="Hero Subheadline" value={form.heroSubheadline} onChange={(v) => set("heroSubheadline", v)} multiline
                hint="Supporting text below the headline." />
            </div>
          </SectionCard>

          <SectionCard title="Mission Statement" section="mission" activeSection={activeSection} onActivate={setActiveSection}>
            <Field label="Mission Statement" value={form.missionStatement} onChange={(v) => set("missionStatement", v)} multiline
              hint="Shown in the mission section on the home page and in the site footer." />
          </SectionCard>

          <SectionCard title="Homepage Stats & Verse" section="stats" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Villages number" value={form.statCommunities ?? ""} onChange={(v) => set("statCommunities", v)} />
                <Field label="Villages label" value={form.statCommunitiesLabel ?? ""} onChange={(v) => set("statCommunitiesLabel", v)} />
                <Field label="Families number" value={form.statFamilies ?? ""} onChange={(v) => set("statFamilies", v)} />
                <Field label="Families label" value={form.statFamiliesLabel ?? ""} onChange={(v) => set("statFamiliesLabel", v)} />
                <Field label="Projects number" value={form.statProjects ?? ""} onChange={(v) => set("statProjects", v)} />
                <Field label="Projects label" value={form.statProjectsLabel ?? ""} onChange={(v) => set("statProjectsLabel", v)} />
                <Field label="Team number" value={form.statTeam ?? ""} onChange={(v) => set("statTeam", v)} />
                <Field label="Team label" value={form.statTeamLabel ?? ""} onChange={(v) => set("statTeamLabel", v)} />
              </div>
              <Field label="Verse text" value={form.verseText ?? ""} onChange={(v) => set("verseText", v)} multiline />
              <Field label="Verse reference" value={form.verseReference ?? ""} onChange={(v) => set("verseReference", v)} />
            </div>
          </SectionCard>

          <SectionCard title="Donate Page" section="donate" activeSection={activeSection} onActivate={setActiveSection}>
            <Field label="Donate Page Headline" value={form.donatePageHeadline} onChange={(v) => set("donatePageHeadline", v)}
              hint='Simple is best, e.g. "Partner With Us".' />
          </SectionCard>

          <SectionCard title="Contact Information" section="contact" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <Field label="Email Address" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} />
              <Field label="Phone Number" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
              <Field label="USA address" value={form.usaAddress ?? ""} onChange={(v) => set("usaAddress", v)} multiline
                hint="Leave blank to hide on the Contact page until you add it." />
              <Field label="Congo / DRC address" value={form.congoAddress ?? ""} onChange={(v) => set("congoAddress", v)} multiline />
            </div>
          </SectionCard>

          <SectionCard title="Social Media Links" section="social" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} />
              <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
              <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} />
            </div>
          </SectionCard>

          <div
            className={`rounded-2xl border p-6 transition-colors ${activeSection === "images" ? "border-[#6E9277]/50 bg-[#6E9277]/5" : "border-muted bg-card"}`}
            onMouseEnter={() => setActiveSection("images")}
          >
            <div className="mb-4 pb-3 border-b border-muted">
              <h3 className="text-sm font-semibold text-foreground">Page top banner images</h3>
              <p className="text-xs text-muted-foreground mt-1">
                These change the large image at the top of each public page. Each upload saves automatically.
                Logos cannot be changed here. To add gallery photos, use Photo Library (not this section).
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {MEDIA_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  onMouseEnter={() => {
                    setActiveSection("images");
                    setActiveImageSlot(slot);
                  }}
                  onFocusCapture={() => {
                    setActiveSection("images");
                    setActiveImageSlot(slot);
                  }}
                >
                  <AdminMediaSlotField
                    label={slot.label}
                    value={slot.getValue(mediaForm)}
                    folder={slot.folder}
                    saving={savingMediaSlot === slot.id}
                    onUploaded={(publicUrl) => void handleMediaUpload(slot, publicUrl)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">{slot.previewLabel}</p>
                  <a
                    href={`${slot.viewUrl}?v=${Date.now()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E9277] hover:underline mt-1"
                  >
                    Open that page <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {isDemoContentEnabled() && (
            <div className="bg-card rounded-2xl border border-red-100 p-6">
              <h3 className="text-sm font-semibold text-red-500 mb-4 pb-3 border-b border-red-100">Danger Zone</h3>
              <p className="text-xs text-muted-foreground mb-4">Reset all demo content to factory defaults. Development only.</p>
              <button
                onClick={() => {
                  if (confirm("Reset ALL content to defaults? This cannot be undone.")) {
                    localStorage.removeItem("obom_posts");
                    localStorage.removeItem("obom_photos");
                    localStorage.removeItem("obom_projects");
                    localStorage.removeItem("obom_videos");
                    localStorage.removeItem("obom_settings");
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          )}
      </div>

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-muted bg-card">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Full screen preview</h2>
                <p className="text-sm text-muted-foreground">{SECTION_LABELS[activeSection]}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isDirty && activeSection !== "images" && (
                  <p className="text-xs font-medium text-amber-700">
                    Unsaved changes. Click Save Changes to publish.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-foreground border border-muted hover:bg-muted transition-colors"
                >
                  <X size={16} />
                  Close preview
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <AdminSettingsPreview
                form={form}
                mediaForm={mediaForm}
                activeSection={activeSection}
                isDirty={isDirty}
                fullScreen
                activeImageLabel={activeImageSlot.label}
                activeImageUrl={activeImageSlot.getValue(mediaForm)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
