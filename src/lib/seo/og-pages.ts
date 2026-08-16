import { getPublicMediaBundle } from "@/lib/media/resolve";
import type { SiteMediaBundle } from "@/lib/media/types";
import { siteConfig } from "@/lib/site";

export const OG_PAGE_KEYS = [
  "home",
  "about",
  "projects",
  "photos",
  "videos",
  "stories",
  "donate",
  "contact",
] as const;

export type OgPageKey = (typeof OG_PAGE_KEYS)[number];

export const OG_PAGE_COPY: Record<OgPageKey, { title: string; subtitle: string }> = {
  home: { title: siteConfig.name, subtitle: siteConfig.tagline },
  about: {
    title: "About",
    subtitle: "The story, vision, and leadership behind One By One Ministries.",
  },
  projects: {
    title: "Projects",
    subtitle: "Education, entrepreneurship, and discipleship in the DRC.",
  },
  photos: {
    title: "Photos",
    subtitle: "Moments from the field across the Democratic Republic of Congo.",
  },
  videos: {
    title: "Videos",
    subtitle: "Documentaries and field updates from One By One Ministries.",
  },
  stories: {
    title: "Stories & Updates",
    subtitle: "Field stories and ministry updates from the DRC.",
  },
  donate: {
    title: "Donate",
    subtitle: "Give to change a life in Congo.",
  },
  contact: {
    title: "Contact",
    subtitle: "Questions, partnerships, and prayer requests welcome.",
  },
};

export function isOgPageKey(value: string): value is OgPageKey {
  return (OG_PAGE_KEYS as readonly string[]).includes(value);
}

export function heroUrlForOgPage(media: SiteMediaBundle, page: OgPageKey) {
  switch (page) {
    case "home":
      return media.websiteUseImages.hero;
    case "about":
      return media.websiteUseImages.about;
    case "projects":
      return media.websiteUseImages.projects;
    case "photos":
      return media.websiteUseImages.community;
    case "videos":
      return media.websiteUseImages.outreach;
    case "stories":
      return media.localImages.storyHero;
    case "donate":
      return media.localImages.donateHero;
    case "contact":
      return media.localImages.contactHero;
  }
}

export async function getOgHeroForPage(page: OgPageKey) {
  const { media } = await getPublicMediaBundle();
  return heroUrlForOgPage(media, page);
}
