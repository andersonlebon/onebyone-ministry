import "server-only";

import { defaultSiteSettings } from "@/content/site-defaults";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getSiteContentValue } from "@/lib/db/site-content";
import { mergeAboutContent } from "./about-defaults";
import { getDefaultSiteContentBundle } from "./defaults";
import { SITE_CONTENT_KEYS } from "./keys";
import {
  getHeroHeadlineLines,
  normalizeHeroHeadlineLines,
  syncHeroHeadlineFromLines,
} from "./hero-headline";
import { normalizePosts } from "./posts";
import {
  EMPTY_FINANCE,
  type AboutPageContent,
  type FinanceDetails,
  type Post,
  type Project,
  type SiteContentBundle,
  type SiteSettings,
  type Video,
} from "./types";

function mergeSettings(stored: SiteSettings | null): SiteSettings {
  const merged = { ...defaultSiteSettings, ...(stored ?? {}) } as SiteSettings;
  const lines = normalizeHeroHeadlineLines(merged.heroHeadlineLines);
  const resolved = lines.length > 0 ? lines : getHeroHeadlineLines(merged);
  return {
    ...merged,
    heroHeadlineLines: resolved,
    heroHeadline: syncHeroHeadlineFromLines(resolved) || merged.heroHeadline,
  };
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  const defaults = getDefaultSiteContentBundle();

  if (!isDatabaseConfigured()) {
    return defaults;
  }

  try {
    const [settings, posts, projects, videos, finance, about] = await Promise.all([
      getSiteContentValue<SiteSettings>(SITE_CONTENT_KEYS.settings),
      getSiteContentValue<Post[]>(SITE_CONTENT_KEYS.posts),
      getSiteContentValue<Project[]>(SITE_CONTENT_KEYS.projects),
      getSiteContentValue<Video[]>(SITE_CONTENT_KEYS.videos),
      getSiteContentValue<FinanceDetails>(SITE_CONTENT_KEYS.finance),
      getSiteContentValue<AboutPageContent>(SITE_CONTENT_KEYS.about),
    ]);

    // Empty arrays are intentional (client-managed). Only null/missing falls back.
    return {
      settings: mergeSettings(settings),
      posts: normalizePosts(posts ?? []),
      projects: projects ?? [],
      videos: videos ?? [],
      finance: finance ?? { ...EMPTY_FINANCE },
      about: mergeAboutContent(about),
    };
  } catch (error) {
    console.error("[site-content] Failed to load bundle:", error);
    return defaults;
  }
}
