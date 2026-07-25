import { EMPTY_IMAGE, buildPlaceholderMediaBundle } from "./placeholders";
import type { SiteMediaBundle } from "./types";

/**
 * Paths that are no longer valid content sources.
 * Logos (brand-transparent) and real admin uploads (general/, photos/, …) stay.
 * Old setup-seeded banners under seed/brand and seed/website-use are retired.
 */
function isRetiredContentPath(url: string): boolean {
  if (!url) return true;
  if (url === EMPTY_IMAGE) return false;
  if (url.includes("/brand-transparent/") || url.startsWith("/assets/brand-transparent/")) {
    return false;
  }
  if (url.startsWith("/assets/placeholders/")) return false;

  // Retired local folders (removed from /public)
  if (url.startsWith("/assets/brand/")) return true;
  if (url.startsWith("/assets/website-use/")) return true;
  if (url.startsWith("/assets/photos/")) return true;
  if (url.startsWith("/assets/distribution-")) return true;
  if (url.startsWith("/assets/video-thumbs/")) return true;
  if (url.startsWith("/images/gallery/")) return true;

  // Retired setup seed banners (logos live under seed/brand-transparent/)
  if (url.includes("/seed/brand/") || url.includes("/seed/website-use/")) return true;

  return false;
}

function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string" || !url.trim()) return EMPTY_IMAGE;
  if (isRetiredContentPath(url)) return EMPTY_IMAGE;
  return url;
}

/**
 * Merge stored media with empty defaults.
 * Keeps logos + real Supabase uploads; replaces missing/retired local paths with EMPTY_IMAGE.
 */
export function sanitizeMediaBundle(stored: SiteMediaBundle | null | undefined): SiteMediaBundle {
  const defaults = buildPlaceholderMediaBundle();
  if (!stored || typeof stored !== "object") return defaults;

  const websiteUseImages = { ...defaults.websiteUseImages };
  for (const key of Object.keys(websiteUseImages) as Array<keyof typeof websiteUseImages>) {
    websiteUseImages[key] = sanitizeUrl(stored.websiteUseImages?.[key]);
  }

  const localImages = { ...defaults.localImages };
  for (const key of Object.keys(localImages) as Array<keyof typeof localImages>) {
    localImages[key] = sanitizeUrl(stored.localImages?.[key]);
  }

  const brandAssets = {
    ...defaults.brandAssets,
    ...(stored.brandAssets ?? {}),
  };

  return {
    ...defaults,
    ...stored,
    brandAssets,
    websiteUseImages,
    localImages,
    galleryPhotos: [],
    ministryVideos: Array.isArray(stored.ministryVideos) ? stored.ministryVideos : [],
    featuredVideo: stored.featuredVideo ?? defaults.featuredVideo,
    homePillars: (stored.homePillars?.length ? stored.homePillars : defaults.homePillars).map(
      (p) => ({ ...p, img: sanitizeUrl(p.img) })
    ),
    homeProjects: Array.isArray(stored.homeProjects) ? stored.homeProjects.map(sanitizeUrl) : [],
    homeStories: Array.isArray(stored.homeStories) ? stored.homeStories.map(sanitizeUrl) : [],
    aboutStoryImages: (
      stored.aboutStoryImages?.length ? stored.aboutStoryImages : defaults.aboutStoryImages
    ).map(sanitizeUrl),
    projectImages: Array.isArray(stored.projectImages)
      ? stored.projectImages.map(sanitizeUrl)
      : [],
    storyImages: Array.isArray(stored.storyImages) ? stored.storyImages.map(sanitizeUrl) : [],
    founderTimelineImages: (
      stored.founderTimelineImages?.length
        ? stored.founderTimelineImages
        : defaults.founderTimelineImages
    ).map(sanitizeUrl),
  };
}
