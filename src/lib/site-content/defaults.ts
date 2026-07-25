import { defaultSiteSettings } from "@/content/site-defaults";

import { getDefaultAboutContent } from "./about-defaults";
import {
  EMPTY_FINANCE,
  type SiteContentBundle,
  type SiteSettings,
} from "./types";

export const PRODUCTION_SETTINGS: SiteSettings = {
  ...defaultSiteSettings,
};

export function getDefaultSiteContentBundle(): SiteContentBundle {
  return {
    settings: { ...PRODUCTION_SETTINGS },
    posts: [],
    projects: [],
    videos: [],
    finance: { ...EMPTY_FINANCE },
    about: getDefaultAboutContent(),
  };
}

export function getEmptySiteContentBundle(): SiteContentBundle {
  return {
    settings: { ...PRODUCTION_SETTINGS },
    posts: [],
    projects: [],
    videos: [],
    finance: { ...EMPTY_FINANCE },
    about: getDefaultAboutContent(),
  };
}
