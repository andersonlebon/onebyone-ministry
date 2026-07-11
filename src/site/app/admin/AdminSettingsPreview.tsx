"use client";

import { Facebook, Instagram, Mail, Phone, X, Youtube } from "lucide-react";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { SiteSettings } from "@/site/lib/siteStore";
import { useMediaUrl } from "@/site/lib/mediaContext";

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
  isDirty: boolean;
  fullScreen?: boolean;
  onClose?: () => void;
  activeImageLabel?: string;
  activeImageUrl?: string;
};

export const SECTION_LABELS: Record<SettingsPreviewSection, string> = {
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
  isDirty,
  fullScreen = false,
  onClose,
  activeImageLabel,
  activeImageUrl,
}: AdminSettingsPreviewProps) {
  const heroImage = useMediaUrl(mediaForm.websiteUseImages.hero);
  const donateHero = useMediaUrl(mediaForm.localImages.donateHero);
  const activeImage = useMediaUrl(activeImageUrl ?? "");
  const showDraftReminder = isDirty && activeSection !== "images";
  const previewKind = showDraftReminder ? "Draft preview" : "Live preview";

  return (
    <div
      className={
        fullScreen
          ? "flex flex-col h-full min-h-0 bg-card"
          : "rounded-2xl border border-muted bg-card overflow-hidden shadow-sm"
      }
    >
      <div
        className={`px-4 py-3 border-b border-muted shrink-0 ${showDraftReminder ? "bg-amber-500/10" : "bg-[#6E9277]/8"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${showDraftReminder ? "text-amber-700" : "text-[#6E9277]"}`}
            >
              {previewKind}
            </p>
            <p className={`font-semibold text-foreground mt-0.5 ${fullScreen ? "text-base" : "text-sm"}`}>
              {SECTION_LABELS[activeSection]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {showDraftReminder
                ? "Shows your unsaved edits. Click Save Changes to publish to the live website."
                : activeSection === "images"
                  ? "Hero image uploads save to the live site automatically."
                  : "This matches what visitors see on the public site right now."}
            </p>
          </div>
          {fullScreen && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={
          fullScreen
            ? "flex-1 overflow-y-auto p-6 md:p-10"
            : "p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto"
        }
      >
        <div className={fullScreen ? "mx-auto w-full max-w-3xl space-y-4" : "space-y-4"}>
        {activeSection === "homepage" && (
          <div className="rounded-xl overflow-hidden border border-muted">
            <div className={`relative bg-[#1a2a1f] ${fullScreen ? "h-56 md:h-72" : "h-36"}`}>
              {heroImage ? (
                <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              ) : null}
              <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-end">
                <p className={`text-white font-semibold leading-tight ${fullScreen ? "text-2xl md:text-3xl" : "text-lg"}`}>
                  {form.heroHeadline || "Hero headline"}
                </p>
                <p className={`text-white/85 mt-2 ${fullScreen ? "text-sm md:text-base line-clamp-4" : "text-xs line-clamp-3"}`}>
                  {form.heroSubheadline || "Hero subheadline"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "mission" && (
          <div className={`rounded-xl border border-muted bg-[#FAF8F5] ${fullScreen ? "p-6 md:p-8" : "p-4"}`}>
            <p className="text-[10px] uppercase tracking-widest text-[#6E9277] mb-2">Our Mission</p>
            <p className={`text-[#5A4749] italic leading-relaxed ${fullScreen ? "text-lg md:text-xl" : "text-sm"}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {form.missionStatement || "Mission statement preview"}
            </p>
          </div>
        )}

        {activeSection === "donate" && (
          <div className="rounded-xl overflow-hidden border border-muted">
            <div className={`relative bg-[#474747] ${fullScreen ? "h-48 md:h-64" : "h-28"}`}>
              {donateHero ? (
                <img src={donateHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              ) : null}
              <div className="relative z-10 p-4 md:p-6 flex items-end h-full">
                <p className={`text-white font-semibold ${fullScreen ? "text-2xl md:text-3xl" : "text-lg"}`}>
                  {form.donatePageHeadline || "Donate page headline"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className={`rounded-xl border border-muted space-y-3 ${fullScreen ? "p-6 md:p-8" : "p-4"}`}>
            <div className={`flex items-center gap-2 text-foreground ${fullScreen ? "text-base" : "text-sm"}`}>
              <Mail size={fullScreen ? 18 : 14} className="text-[#6E9277]" />
              {form.contactEmail || "contact@example.com"}
            </div>
            <div className={`flex items-center gap-2 text-foreground ${fullScreen ? "text-base" : "text-sm"}`}>
              <Phone size={fullScreen ? 18 : 14} className="text-[#6E9277]" />
              {form.contactPhone || "Phone number"}
            </div>
          </div>
        )}

        {activeSection === "social" && (
          <div className={`rounded-xl border border-muted ${fullScreen ? "p-6 md:p-8" : "p-4"}`}>
            <p className={`text-muted-foreground mb-3 ${fullScreen ? "text-sm" : "text-xs"}`}>
              Footer social icons link to:
            </p>
            <div className={`space-y-2 ${fullScreen ? "text-sm" : "text-xs"}`}>
              {form.facebookUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Facebook size={fullScreen ? 16 : 14} className="text-[#6E9277]" /> {form.facebookUrl}
                </div>
              ) : null}
              {form.instagramUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Instagram size={fullScreen ? 16 : 14} className="text-[#6E9277]" /> {form.instagramUrl}
                </div>
              ) : null}
              {form.youtubeUrl ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Youtube size={fullScreen ? 16 : 14} className="text-[#6E9277]" /> {form.youtubeUrl}
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
            <div className={`relative bg-muted ${fullScreen ? "h-64 md:h-80" : "h-40"}`}>
              {activeImage ? (
                <img src={activeImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  No image uploaded yet
                </div>
              )}
            </div>
            <div className={`border-t border-muted ${fullScreen ? "p-4 md:p-5" : "p-3"}`}>
              <p className={`font-semibold text-foreground ${fullScreen ? "text-base" : "text-sm"}`}>
                {activeImageLabel ?? "Hero image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Upload saves automatically to the live site.</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
