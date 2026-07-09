"use client";

import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { SiteSettings } from "@/site/lib/siteStore";

export type SettingsPreviewSection =
  | "homepage"
  | "mission"
  | "donate"
  | "contact"
  | "social"
  | "images";

type AdminSettingsPreviewProps = {
  form: SiteSettings;
  mediaForm: SiteMediaBundle;
  activeSection: SettingsPreviewSection;
  activeImageLabel?: string;
  activeImageUrl?: string;
};

const SECTION_LABELS: Record<SettingsPreviewSection, string> = {
  homepage: "Homepage hero",
  mission: "Mission section",
  donate: "Donate page",
  contact: "Contact page & footer",
  social: "Footer social links",
  images: "Page hero image",
};

export default function AdminSettingsPreview({
  form,
  mediaForm,
  activeSection,
  activeImageLabel,
  activeImageUrl,
}: AdminSettingsPreviewProps) {
  const heroImage = mediaForm.websiteUseImages.hero;

  return (
    <div className="rounded-2xl border border-muted bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-muted bg-[#6E9277]/8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6E9277]">Live preview</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{SECTION_LABELS[activeSection]}</p>
        <p className="text-xs text-muted-foreground mt-1">This is how your changes will look on the public site.</p>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {activeSection === "homepage" && (
          <div className="rounded-xl overflow-hidden border border-muted">
            <div className="relative h-36 bg-[#1a2a1f]">
              {heroImage ? (
                <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              ) : null}
              <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                <p className="text-white text-lg font-semibold leading-tight">
                  {form.heroHeadline || "Hero headline"}
                </p>
                <p className="text-white/85 text-xs mt-2 line-clamp-3">
                  {form.heroSubheadline || "Hero subheadline"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "mission" && (
          <div className="rounded-xl border border-muted p-4 bg-[#FAF8F5]">
            <p className="text-[10px] uppercase tracking-widest text-[#6E9277] mb-2">Our Mission</p>
            <p className="text-sm text-[#5A4749] italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {form.missionStatement || "Mission statement preview"}
            </p>
          </div>
        )}

        {activeSection === "donate" && (
          <div className="rounded-xl overflow-hidden border border-muted">
            <div className="relative h-28 bg-[#474747]">
              {mediaForm.localImages.donateHero ? (
                <img src={mediaForm.localImages.donateHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              ) : null}
              <div className="relative z-10 p-4 flex items-end h-full">
                <p className="text-white text-lg font-semibold">
                  {form.donatePageHeadline || "Donate page headline"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="rounded-xl border border-muted p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Mail size={14} className="text-[#6E9277]" />
              {form.contactEmail || "contact@example.com"}
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Phone size={14} className="text-[#6E9277]" />
              {form.contactPhone || "Phone number"}
            </div>
          </div>
        )}

        {activeSection === "social" && (
          <div className="rounded-xl border border-muted p-4">
            <p className="text-xs text-muted-foreground mb-3">Footer social icons link to:</p>
            <div className="space-y-2 text-xs">
              {form.facebookUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Facebook size={14} className="text-[#6E9277]" /> {form.facebookUrl}
                </div>
              ) : null}
              {form.instagramUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Instagram size={14} className="text-[#6E9277]" /> {form.instagramUrl}
                </div>
              ) : null}
              {form.youtubeUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Youtube size={14} className="text-[#6E9277]" /> {form.youtubeUrl}
                </div>
              ) : null}
              {!form.facebookUrl && !form.instagramUrl && !form.youtubeUrl && (
                <p className="text-muted-foreground">Add at least one social link.</p>
              )}
            </div>
          </div>
        )}

        {activeSection === "images" && (
          <div className="rounded-xl overflow-hidden border border-muted">
            <div className="relative h-40 bg-muted">
              {activeImageUrl ? (
                <img src={activeImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  No image uploaded yet
                </div>
              )}
            </div>
            <div className="p-3 border-t border-muted">
              <p className="text-sm font-semibold text-foreground">{activeImageLabel ?? "Hero image"}</p>
              <p className="text-xs text-muted-foreground mt-1">Upload saves automatically to the live site.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
