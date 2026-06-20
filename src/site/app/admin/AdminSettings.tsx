"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Save, CheckCircle2 } from "lucide-react";
import { useSiteStore, SiteSettings } from "@/site/lib/siteStore";

function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#474747] mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[#7a7068] mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:border-[#6E9277] resize-none"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      )}
    </div>
  );
}

export default function AdminSettings() {
  const { settings, updateSettings } = useSiteStore();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof SiteSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl text-[#474747]">Site Settings</h1>
          <p className="text-sm text-[#7a7068]">Manage website content, copy, and configuration.</p>
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
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-4 pb-3 border-b border-[#e3d9ce]">Homepage Content</h3>
          <div className="space-y-4">
            <Field label="Hero Headline" value={form.heroHeadline} onChange={(v) => set("heroHeadline", v)}
              hint="The main heading displayed on the homepage hero section." />
            <Field label="Hero Subheadline" value={form.heroSubheadline} onChange={(v) => set("heroSubheadline", v)} multiline
              hint="Supporting text below the hero headline." />
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-4 pb-3 border-b border-[#e3d9ce]">Mission & About Content</h3>
          <div className="space-y-4">
            <Field label="Mission Statement" value={form.missionStatement} onChange={(v) => set("missionStatement", v)} multiline
              hint="Displayed in the mission section and About page." />
          </div>
        </div>

        {/* Donate */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-4 pb-3 border-b border-[#e3d9ce]">Donate Page</h3>
          <Field label="Donate Page Headline" value={form.donatePageHeadline} onChange={(v) => set("donatePageHeadline", v)} />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-4 pb-3 border-b border-[#e3d9ce]">Contact Information</h3>
          <div className="space-y-4">
            <Field label="Email Address" value={form.contactEmail} onChange={(v) => set("contactEmail", v)} />
            <Field label="Phone Number" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-4 pb-3 border-b border-[#e3d9ce]">Social Media Links</h3>
          <div className="space-y-4">
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} />
            <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
            <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} />
          </div>
        </div>

        {/* Danger */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h3 className="text-sm font-semibold text-red-500 mb-4 pb-3 border-b border-red-100">Danger Zone</h3>
          <p className="text-xs text-[#7a7068] mb-4">Reset all content to factory defaults. This cannot be undone.</p>
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
      </div>
    </div>
  );
}
