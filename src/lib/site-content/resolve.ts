import "server-only";

import {
  defaultProjects,
  defaultSiteSettings,
  defaultVideos,
} from "@/content/site-defaults";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getSiteContentValue } from "@/lib/db/site-content";
import { isSetupComplete } from "@/lib/db/setup";

import { getDefaultSiteContentBundle } from "./defaults";
import { SITE_CONTENT_KEYS } from "./keys";
import { normalizePosts } from "./posts";
import {
  EMPTY_FINANCE,
  type FinanceDetails,
  type Post,
  type Project,
  type SiteContentBundle,
  type SiteSettings,
  type Video,
} from "./types";

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  const defaults = getDefaultSiteContentBundle();

  if (!isDatabaseConfigured()) {
    return defaults;
  }

  try {
    const setupDone = await isSetupComplete();
    if (!setupDone) {
      return defaults;
    }

    const [settings, posts, projects, videos, finance] = await Promise.all([
      getSiteContentValue<SiteSettings>(SITE_CONTENT_KEYS.settings),
      getSiteContentValue<Post[]>(SITE_CONTENT_KEYS.posts),
      getSiteContentValue<Project[]>(SITE_CONTENT_KEYS.projects),
      getSiteContentValue<Video[]>(SITE_CONTENT_KEYS.videos),
      getSiteContentValue<FinanceDetails>(SITE_CONTENT_KEYS.finance),
    ]);

    return {
      settings: settings ?? { ...defaultSiteSettings },
      posts: normalizePosts(posts ?? []),
      projects: projects ?? defaultProjects.map((p) => ({ ...p })),
      videos: videos ?? defaultVideos.map((v) => ({ ...v })),
      finance: finance ?? { ...EMPTY_FINANCE },
    };
  } catch (error) {
    console.error("[site-content] Failed to load bundle:", error);
    return defaults;
  }
}
