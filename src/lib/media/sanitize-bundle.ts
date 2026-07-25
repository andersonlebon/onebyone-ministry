import { DEFAULT_HOME_PILLARS, EMPTY_IMAGE, buildPlaceholderMediaBundle } from "./placeholders";
import type { HomePillar, HomePillarIcon, SiteMediaBundle } from "./types";

const PILLAR_ICONS: HomePillarIcon[] = ["BookOpen", "Lightbulb", "Heart", "Users"];

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

  const defaultByKey = new Map(DEFAULT_HOME_PILLARS.map((p) => [p.key, p]));
  const storedPillars = Array.isArray(stored.homePillars) ? stored.homePillars : [];
  const homePillars: HomePillar[] =
    storedPillars.length > 0
      ? storedPillars.map((raw, index) => {
          const fallback = defaultByKey.get(raw.key) ?? DEFAULT_HOME_PILLARS[index] ?? DEFAULT_HOME_PILLARS[0];
          const icon =
            typeof raw.icon === "string" && PILLAR_ICONS.includes(raw.icon as HomePillarIcon)
              ? (raw.icon as HomePillarIcon)
              : fallback.icon;
          return {
            key: typeof raw.key === "string" && raw.key ? raw.key : fallback.key,
            img: sanitizeUrl(raw.img),
            title: typeof raw.title === "string" && raw.title.trim() ? raw.title : fallback.title,
            desc: typeof raw.desc === "string" && raw.desc.trim() ? raw.desc : fallback.desc,
            color: typeof raw.color === "string" && raw.color.trim() ? raw.color : fallback.color,
            icon,
          };
        })
      : defaults.homePillars.map((p) => ({ ...p }));

  const heading = stored.homePillarsHeading;
  const homePillarsHeading = {
    eyebrow:
      typeof heading?.eyebrow === "string" && heading.eyebrow.trim()
        ? heading.eyebrow
        : defaults.homePillarsHeading.eyebrow,
    title:
      typeof heading?.title === "string" && heading.title.trim()
        ? heading.title
        : defaults.homePillarsHeading.title,
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
    homePillars,
    homePillarsHeading,
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
