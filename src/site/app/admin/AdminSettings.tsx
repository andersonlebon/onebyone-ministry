"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Save, CheckCircle2 } from "lucide-react";
import { updateSiteMediaAction } from "@/app/actions/site-media";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { MediaFolder } from "@/lib/db/schema";
import { useSiteMedia } from "@/site/lib/mediaContext";
import AdminMediaSlotField from "@/site/app/components/admin/AdminMediaSlotField";
import { useSiteStore, SiteSettings } from "@/site/lib/siteStore";
import { isDemoContentEnabled } from "@/lib/runtime-env";

type MediaSlotConfig = {
  id: string;
  label: string;
  folder: MediaFolder;
  getValue: (media: SiteMediaBundle) => string;
  applyValue: (media: SiteMediaBundle, url: string) => SiteMediaBundle;
};

const MEDIA_SLOTS: MediaSlotConfig[] = [
  {
    id: "hero",
    label: "Homepage hero",
    folder: "general",
    getValue: (m) => m.websiteUseImages.hero,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, hero: url } }),
  },
  {
    id: "about",
    label: "About page hero",
    folder: "general",
    getValue: (m) => m.websiteUseImages.about,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, about: url } }),
  },
  {
    id: "projects",
    label: "Projects page hero",
    folder: "general",
    getValue: (m) => m.websiteUseImages.projects,
    applyValue: (m, url) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, projects: url } }),
  },
  {
    id: "contactHero",
    label: "Contact page hero",
    folder: "general",
    getValue: (m) => m.localImages.contactHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, contactHero: url } }),
  },
  {
    id: "donateHero",
    label: "Donate page hero",
    folder: "general",
    getValue: (m) => m.localImages.donateHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, donateHero: url } }),
  },
  {
    id: "storyHero",
    label: "Stories page hero",
    folder: "general",
    getValue: (m) => m.localImages.storyHero,
    applyValue: (m, url) => ({ ...m, localImages: { ...m.localImages, storyHero: url } }),
  },
  {
    id: "logoDark",
    label: "Logo (dark background)",
    folder: "brand",
    getValue: (m) => m.brandAssets.logoDark,
    applyValue: (m, url) => ({ ...m, brandAssets: { ...m.brandAssets, logoDark: url } }),
  },
  {
    id: "logoWhite",
    label: "Logo (light background)",
    folder: "brand",
    getValue: (m) => m.brandAssets.logoWhite,
    applyValue: (m, url) => ({ ...m, brandAssets: { ...m.brandAssets, logoWhite: url } }),
  },
];

function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6E9277] resize-none"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      )}
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
  const [savingMediaSlot, setSavingMediaSlot] = useState<string | null>(null);

  const set = (k: keyof SiteSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleMediaUpload = async (slot: MediaSlotConfig, publicUrl: string) => {
    const next = slot.applyValue(mediaForm, publicUrl);
    setMediaForm(next);
    setSavingMediaSlot(slot.id);

    try {
      await updateSiteMediaAction(next);
      router.refresh();
    } finally {
      setSavingMediaSlot(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Homepage text, contact info, social links, and hero images. Shows on the home page, footer, and Contact page.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: saved ? "#5a7d64" : "#6E9277" }}
        >
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Homepage */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">Homepage Content</h3>
          <div className="space-y-4">
            <Field label="Hero Headline" value={form.heroHeadline} onChange={(v) => set("heroHeadline", v)}
              hint="The main heading displayed on the homepage hero section." />
            <Field label="Hero Subheadline" value={form.heroSubheadline} onChange={(v) => set("heroSubheadline", v)} multiline
              hint="Supporting text below the hero headline." />
          </div>
        </div>

        {/* Mission */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">Mission & About Content</h3>
          <div className="space-y-4">
            <Field label="Mission Statement" value={form.missionStatement} onChange={(v) => set("missionStatement", v)} multiline
              hint="Displayed in the mission section and About page." />
          </div>
        </div>

        {/* Donate */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">Donate Page</h3>
          <Field label="Donate Page Headline" value={form.donatePageHeadline} onChange={(v) => set("donatePageHeadline", v)} />
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">Contact Information</h3>
          <div className="space-y-4">
            <Field label="Email Address" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} />
            <Field label="Phone Number" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
          </div>
        </div>

        {/* Social */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-muted">Social Media Links</h3>
          <div className="space-y-4">
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} />
            <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
            <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} />
          </div>
        </div>

        {/* Site media */}
        <div className="bg-card rounded-2xl border border-muted p-6">
          <div className="mb-4 pb-3 border-b border-muted">
            <h3 className="text-sm font-semibold text-foreground">Site Images</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Upload hero images and logos from your computer. Each upload saves automatically and appears on the public site.
              Gallery photos are managed separately in Photo Library.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {MEDIA_SLOTS.map((slot) => (
              <AdminMediaSlotField
                key={slot.id}
                label={slot.label}
                value={slot.getValue(mediaForm)}
                folder={slot.folder}
                saving={savingMediaSlot === slot.id}
                onUploaded={(publicUrl) => void handleMediaUpload(slot, publicUrl)}
              />
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
    </div>
  );
}
