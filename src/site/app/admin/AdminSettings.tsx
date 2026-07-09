"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSiteMediaAction } from "@/app/actions/site-media";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { MediaFolder } from "@/lib/db/schema";
import { useSiteMedia } from "@/site/lib/mediaContext";
import AdminMediaSlotField from "@/site/app/components/admin/AdminMediaSlotField";
import AdminSettingsPreview, { type SettingsPreviewSection } from "@/site/app/admin/AdminSettingsPreview";
import { useSiteStore, SiteSettings } from "@/site/lib/siteStore";
import { isDemoContentEnabled } from "@/lib/runtime-env";

type MediaSlotConfig = {
  id: string;
  label: string;
  previewLabel: string;
  folder: MediaFolder;
  getValue: (media: SiteMediaBundle) => string;
  applyValue: (media: SiteMediaBundle, url: string) => SiteMediaBundle;
};

const MEDIA_SLOTS: MediaSlotConfig[] = [
  {
    id: "hero",
    label: "Homepage hero",
    previewLabel: "Shows on the home page hero",
    folder: "general",
    getValue: (m) => m.websiteUseImages.hero,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, hero: url } }),
  },
  {
    id: "about",
    label: "About page hero",
    previewLabel: "Shows on the About page header",
    folder: "general",
    getValue: (m) => m.websiteUseImages.about,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, about: url } }),
  },
  {
    id: "projects",
    label: "Projects page hero",
    previewLabel: "Shows on the Projects page header",
    folder: "general",
    getValue: (m) => m.websiteUseImages.projects,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, projects: url } }),
  },
  {
    id: "contactHero",
    label: "Contact page hero",
    previewLabel: "Shows on the Contact page header",
    folder: "general",
    getValue: (m) => m.localImages.contactHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, contactHero: url } }),
  },
  {
    id: "donateHero",
    label: "Donate page hero",
    previewLabel: "Shows on the Donate page header",
    folder: "general",
    getValue: (m) => m.localImages.donateHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, donateHero: url } }),
  },
  {
    id: "storyHero",
    label: "Stories page hero",
    previewLabel: "Shows on the Stories page header",
    folder: "general",
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
  const [savingMediaSlot, setSavingMediaSlot] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SettingsPreviewSection>("homepage");
  const [activeImageSlot, setActiveImageSlot] = useState<MediaSlotConfig>(MEDIA_SLOTS[0]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    setMediaForm(siteMedia);
  }, [siteMedia]);

  const set = (k: keyof SiteSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
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

    try {
      await updateSiteMediaAction(next);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Image upload saved locally but failed to sync.");
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
            Edit homepage text, contact details, social links, and page hero images. Changes save to the live website.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: saving ? 1 : 1.03 }}
          whileTap={{ scale: saving ? 1 : 0.97 }}
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70"
          style={{ backgroundColor: saved ? "#5a7d64" : "#6E9277" }}
        >
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : saving ? "Saving..." : <><Save size={15} /> Save Changes</>}
        </motion.button>
      </div>

      {saveError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-6 min-w-0">
          <SectionCard title="Homepage Content" section="homepage" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <Field label="Hero Headline" value={form.heroHeadline} onChange={(v) => set("heroHeadline", v)}
                hint="Main heading on the home page hero." />
              <Field label="Hero Subheadline" value={form.heroSubheadline} onChange={(v) => set("heroSubheadline", v)} multiline
                hint="Supporting text below the headline." />
            </div>
          </SectionCard>

          <SectionCard title="Mission Statement" section="mission" activeSection={activeSection} onActivate={setActiveSection}>
            <Field label="Mission Statement" value={form.missionStatement} onChange={(v) => set("missionStatement", v)} multiline
              hint="Shown in the mission section on the home page and in the site footer." />
          </SectionCard>

          <SectionCard title="Donate Page" section="donate" activeSection={activeSection} onActivate={setActiveSection}>
            <Field label="Donate Page Headline" value={form.donatePageHeadline} onChange={(v) => set("donatePageHeadline", v)} />
          </SectionCard>

          <SectionCard title="Contact Information" section="contact" activeSection={activeSection} onActivate={setActiveSection}>
            <div className="space-y-4">
              <Field label="Email Address" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} />
              <Field label="Phone Number" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
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
              <h3 className="text-sm font-semibold text-foreground">Page Hero Images</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a photo for each page header. Each upload saves automatically. Logos are fixed and cannot be changed here.
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

        <aside className="xl:sticky xl:top-24">
          <AdminSettingsPreview
            form={form}
            mediaForm={mediaForm}
            activeSection={activeSection}
            activeImageLabel={activeImageSlot.label}
            activeImageUrl={activeImageSlot.getValue(mediaForm)}
          />
        </aside>
      </div>
    </div>
  );
}
