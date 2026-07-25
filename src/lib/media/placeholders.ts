import type { HomePillar, SiteMediaBundle } from "./types";

/**
 * Neutral SVG used wherever a content photo has not been uploaded yet.
 * Logos stay as real brand files; everything else starts empty.
 */
export const EMPTY_IMAGE = "/assets/placeholders/empty.svg";

const LOGO = {
  logoDark: "/assets/brand-transparent/6-web.png",
  logoWhite: "/assets/brand-transparent/8-web.png",
  logoVertical: "/assets/brand-transparent/5-web.png",
  logoVerticalWhite: "/assets/brand-transparent/7-web.png",
} as const;

export const DEFAULT_HOME_PILLARS: HomePillar[] = [
  {
    key: "education",
    img: EMPTY_IMAGE,
    title: "Education",
    desc: "Building schools, training teachers, and equipping every child with the tools they need to flourish.",
    color: "#6E9277",
    icon: "BookOpen",
  },
  {
    key: "entrepreneurship",
    img: EMPTY_IMAGE,
    title: "Entrepreneurship",
    desc: "Equipping families with skills, micro-grants, and mentorship to build sustainable livelihoods.",
    color: "#EAC79A",
    icon: "Lightbulb",
  },
  {
    key: "discipleship",
    img: EMPTY_IMAGE,
    title: "Spiritual Discipleship",
    desc: "Sharing the Gospel through Bible study, pastoral training, and church partnerships in unreached villages.",
    color: "#6E9277",
    icon: "Heart",
  },
  {
    key: "community",
    img: EMPTY_IMAGE,
    title: "Community Development",
    desc: "Building infrastructure, clean water access, and healthcare systems that lift entire communities.",
    color: "#6E9277",
    icon: "Users",
  },
];

/**
 * Design logos + empty content image slots.
 * After setup/deploy, admins upload real photos into Supabase; those URLs live in DB only.
 */
export function buildPlaceholderMediaBundle(): SiteMediaBundle {
  const websiteUseImages = {
    hero: EMPTY_IMAGE,
    about: EMPTY_IMAGE,
    mission: EMPTY_IMAGE,
    projects: EMPTY_IMAGE,
    outreach: EMPTY_IMAGE,
    community: EMPTY_IMAGE,
    worship: EMPTY_IMAGE,
  };

  const localImages = {
    education: EMPTY_IMAGE,
    educationAlt: EMPTY_IMAGE,
    entrepreneurship: EMPTY_IMAGE,
    discipleship: EMPTY_IMAGE,
    community: EMPTY_IMAGE,
    communityAlt: EMPTY_IMAGE,
    outreach: EMPTY_IMAGE,
    water: EMPTY_IMAGE,
    worship: EMPTY_IMAGE,
    leaderOne: EMPTY_IMAGE,
    leaderTwo: EMPTY_IMAGE,
    leaderThree: EMPTY_IMAGE,
    testimonialOne: EMPTY_IMAGE,
    testimonialTwo: EMPTY_IMAGE,
    storyHero: EMPTY_IMAGE,
    donateHero: EMPTY_IMAGE,
    contactHero: EMPTY_IMAGE,
  };

  return {
    brandAssets: { ...LOGO },
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
    homePillars: DEFAULT_HOME_PILLARS.map((p) => ({ ...p })),
    homePillarsHeading: {
      eyebrow: "How We Serve",
      title: "Four Pillars of Transformation",
    },
    homeProjects: [],
    homeStories: [],
    aboutStoryImages: [EMPTY_IMAGE, EMPTY_IMAGE, EMPTY_IMAGE],
    projectImages: [],
    storyImages: [],
    founderTimelineImages: Array.from({ length: 8 }, () => EMPTY_IMAGE),
  };
}

export const PLACEHOLDER_MEDIA = buildPlaceholderMediaBundle();
