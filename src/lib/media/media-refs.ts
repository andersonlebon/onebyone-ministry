import { EMPTY_IMAGE } from "./placeholders";
import type { SiteMediaBundle } from "./types";

function normalizeUrl(url: string): string {
  return url.split("?")[0] ?? url;
}

/** Collect every content/brand image URL currently referenced in the media bundle. */
export function collectMediaUrls(bundle: SiteMediaBundle): Set<string> {
  const urls = new Set<string>();
  const add = (url: unknown) => {
    if (typeof url !== "string" || !url.trim()) return;
    if (url === EMPTY_IMAGE) return;
    urls.add(normalizeUrl(url));
  };

  Object.values(bundle.brandAssets ?? {}).forEach(add);
  Object.values(bundle.websiteUseImages ?? {}).forEach(add);
  Object.values(bundle.localImages ?? {}).forEach(add);
  (bundle.homePillars ?? []).forEach((p) => add(p.img));
  (bundle.aboutStoryImages ?? []).forEach(add);
  (bundle.founderTimelineImages ?? []).forEach(add);
  (bundle.homeProjects ?? []).forEach(add);
  (bundle.homeStories ?? []).forEach(add);
  (bundle.projectImages ?? []).forEach(add);
  (bundle.storyImages ?? []).forEach(add);
  if (bundle.featuredVideo?.thumb) add(bundle.featuredVideo.thumb);
  (bundle.ministryVideos ?? []).forEach((v) => add(v.thumb));
  (bundle.galleryPhotos ?? []).forEach((p) => add(p.src));

  return urls;
}

/** True if this URL is still used somewhere in the bundle (so we must not delete it). */
export function isMediaUrlStillReferenced(
  bundle: SiteMediaBundle,
  url: string | undefined | null
): boolean {
  if (!url || url === EMPTY_IMAGE) return false;
  return collectMediaUrls(bundle).has(normalizeUrl(url));
}

/**
 * Banner / local image slots that must never be copied onto pillars or timeline slots.
 */
export function reservedBannerUrls(bundle: SiteMediaBundle): Set<string> {
  const urls = new Set<string>();
  const add = (url: unknown) => {
    if (typeof url !== "string" || !url.trim() || url === EMPTY_IMAGE) return;
    urls.add(normalizeUrl(url));
  };
  Object.values(bundle.websiteUseImages ?? {}).forEach(add);
  Object.values(bundle.localImages ?? {}).forEach(add);
  Object.values(bundle.brandAssets ?? {}).forEach(add);
  return urls;
}

/**
 * Ensure list images stay unique and do not reuse banner/hero URLs.
 * First occurrence wins; later duplicates become EMPTY_IMAGE.
 */
export function dedupeImageList(
  images: readonly string[],
  reserved: Set<string>
): string[] {
  const seen = new Set(reserved);
  return images.map((raw) => {
    if (!raw || raw === EMPTY_IMAGE) return EMPTY_IMAGE;
    const url = normalizeUrl(raw);
    if (seen.has(url)) return EMPTY_IMAGE;
    seen.add(url);
    return raw;
  });
}
