import {
  defaultPosts,
  defaultProjects,
  defaultSiteSettings,
  defaultVideos,
} from "@/content/site-defaults";

import {
  EMPTY_FINANCE,
  type SiteContentBundle,
  type SiteSettings,
} from "./types";

export const PRODUCTION_SETTINGS: SiteSettings = {
  heroHeadline: defaultSiteSettings.heroHeadline,
  heroSubheadline: defaultSiteSettings.heroSubheadline,
  missionStatement: defaultSiteSettings.missionStatement,
  donatePageHeadline: defaultSiteSettings.donatePageHeadline,
  contactEmail: defaultSiteSettings.contactEmail,
  contactPhone: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
};

export function getDefaultSiteContentBundle(): SiteContentBundle {
  return {
    settings: { ...PRODUCTION_SETTINGS },
    posts: defaultPosts.map((p) => ({ ...p })),
    projects: defaultProjects.map((p) => ({ ...p })),
    videos: defaultVideos.map((v) => ({ ...v })),
    finance: { ...EMPTY_FINANCE },
  };
}

export function getEmptySiteContentBundle(): SiteContentBundle {
  return {
    settings: { ...PRODUCTION_SETTINGS },
    posts: [],
    projects: [],
    videos: [],
    finance: { ...EMPTY_FINANCE },
  };
}
