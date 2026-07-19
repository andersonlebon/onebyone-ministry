import type { SiteMediaBundle } from "./types";

/**
 * Design-only local paths used before setup / as structural fallbacks.
 * Content photos, videos, and gallery are empty — the client adds those.
 */
export function buildPlaceholderMediaBundle(): SiteMediaBundle {
  const brandAssets = {
    logoDark: "/assets/brand-transparent/6-web.png",
    logoWhite: "/assets/brand-transparent/8-web.png",
    logoVertical: "/assets/brand-transparent/5-web.png",
    logoVerticalWhite: "/assets/brand-transparent/7-web.png",
  };

  const websiteUseImages = {
    hero: "/assets/brand/23-hero.jpg",
    about: "/assets/website-use/2.jpg",
    mission: "/assets/website-use/3.jpg",
    projects: "/assets/website-use/4.jpg",
    outreach: "/assets/website-use/5.jpg",
    community: "/assets/website-use/6.jpg",
    worship: "/assets/website-use/7.jpg",
  };

  // Structural page images only (brand / website-use). No gallery/distribution photos.
  const localImages = {
    education: "/assets/website-use/3.jpg",
    educationAlt: "/assets/website-use/4.jpg",
    entrepreneurship: "/assets/website-use/5.jpg",
    discipleship: "/assets/website-use/7.jpg",
    community: "/assets/website-use/6.jpg",
    communityAlt: "/assets/website-use/2.jpg",
    outreach: "/assets/website-use/5.jpg",
    water: "/assets/website-use/6.jpg",
    worship: "/assets/website-use/7.jpg",
    leaderOne: "/assets/brand/14.jpg",
    leaderTwo: "/assets/brand/15.jpg",
    leaderThree: "/assets/brand/16.jpg",
    testimonialOne: "/assets/website-use/3.jpg",
    testimonialTwo: "/assets/website-use/4.jpg",
    storyHero: "/assets/brand/23-hero.jpg",
    donateHero: "/assets/website-use/4.jpg",
    contactHero: "/assets/website-use/2.jpg",
  };

  return {
    brandAssets,
    websiteUseImages,
    localImages,
    ministryVideos: [],
    featuredVideo: {
      id: "",
      title: "",
      desc: "",
      duration: "",
      category: "",
      thumb: "",
    },
    galleryPhotos: [],
    homePillars: [
      { key: "education", img: localImages.education },
      { key: "entrepreneurship", img: localImages.entrepreneurship },
      { key: "discipleship", img: localImages.discipleship },
      { key: "community", img: localImages.community },
    ],
    homeProjects: [],
    homeStories: [],
    aboutStoryImages: [localImages.education, localImages.worship, localImages.community],
    projectImages: [],
    storyImages: [],
    founderTimelineImages: [
      "/assets/website-use/1.jpg",
      "/assets/website-use/2.jpg",
      "/assets/website-use/3.jpg",
      "/assets/brand/23.jpg",
      "/assets/website-use/4.jpg",
      "/assets/website-use/5.jpg",
      "/assets/website-use/7.jpg",
      "/assets/website-use/6.jpg",
    ],
  };
}

export const PLACEHOLDER_MEDIA = buildPlaceholderMediaBundle();
