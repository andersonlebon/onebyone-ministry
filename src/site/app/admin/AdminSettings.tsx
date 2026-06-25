"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Save, CheckCircle2 } from "lucide-react";
import { updateSiteMediaAction } from "@/app/actions/site-media";
import type { SiteMediaBundle } from "@/lib/media/types";
import { useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteStore, SiteSettings } from "@/site/lib/siteStore";
import { isDemoContentEnabled } from "@/lib/runtime-env";

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
  const [mediaSaved, setMediaSaved] = useState(false);

  const set = (k: keyof SiteSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveMedia = async () => {
    await updateSiteMediaAction(mediaForm);
    setMediaSaved(true);
    router.refresh();
    setTimeout(() => setMediaSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Manage website content, copy, and configuration.</p>
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
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-muted">
            <h3 className="text-sm font-semibold text-foreground">Site Media (Supabase URLs)</h3>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => void handleSaveMedia()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: mediaSaved ? "#5a7d64" : "#6E9277" }}
            >
              {mediaSaved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Media</>}
            </motion.button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Paste Supabase Storage public URLs. Gallery photos and uploads are managed in Photo Library.
          </p>
          <div className="space-y-4">
            <Field label="Homepage hero" value={mediaForm.websiteUseImages.hero}
              onChange={(v) => setMediaForm((m) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, hero: v } }))} />
            <Field label="About page hero" value={mediaForm.websiteUseImages.about}
              onChange={(v) => setMediaForm((m) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, about: v } }))} />
            <Field label="Projects page hero" value={mediaForm.websiteUseImages.projects}
              onChange={(v) => setMediaForm((m) => ({ ...m, websiteUseImages: { ...m.websiteUseImages, projects: v } }))} />
            <Field label="Contact page hero" value={mediaForm.localImages.contactHero}
              onChange={(v) => setMediaForm((m) => ({ ...m, localImages: { ...m.localImages, contactHero: v } }))} />
            <Field label="Donate page hero" value={mediaForm.localImages.donateHero}
              onChange={(v) => setMediaForm((m) => ({ ...m, localImages: { ...m.localImages, donateHero: v } }))} />
            <Field label="Stories page hero" value={mediaForm.localImages.storyHero}
              onChange={(v) => setMediaForm((m) => ({ ...m, localImages: { ...m.localImages, storyHero: v } }))} />
            <Field label="Logo (dark)" value={mediaForm.brandAssets.logoDark}
              onChange={(v) => setMediaForm((m) => ({ ...m, brandAssets: { ...m.brandAssets, logoDark: v } }))} />
            <Field label="Logo (white)" value={mediaForm.brandAssets.logoWhite}
              onChange={(v) => setMediaForm((m) => ({ ...m, brandAssets: { ...m.brandAssets, logoWhite: v } }))} />
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
