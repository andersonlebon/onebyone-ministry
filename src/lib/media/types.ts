export type GalleryPhoto = {
  id: number;
  src: string;
  alt: string;
  /** Legacy category label; public gallery filters by album now. */
  category: string;
  albumId?: string | null;
  albumName?: string | null;
  h: number;
};

export type MinistryVideo = {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumb: string;
  url: string;
};

export type HomePillarIcon = "BookOpen" | "Lightbulb" | "Heart" | "Users";

export type HomePillar = {
  key: string;
  img: string;
  title: string;
  desc: string;
  color: string;
  icon: HomePillarIcon;
};

export type SiteMediaBundle = {
  brandAssets: {
    logoDark: string;
    logoWhite: string;
    logoVertical: string;
    logoVerticalWhite: string;
  };
  websiteUseImages: {
    hero: string;
    about: string;
    mission: string;
    projects: string;
    outreach: string;
    community: string;
    worship: string;
  };
  localImages: {
    education: string;
    educationAlt: string;
    entrepreneurship: string;
    discipleship: string;
    community: string;
    communityAlt: string;
    outreach: string;
    water: string;
    worship: string;
    leaderOne: string;
    leaderTwo: string;
    leaderThree: string;
    testimonialOne: string;
    testimonialTwo: string;
    storyHero: string;
    donateHero: string;
    contactHero: string;
  };
  ministryVideos: MinistryVideo[];
  featuredVideo: {
    id: string;
    title: string;
    desc: string;
    duration: string;
    category: string;
    thumb: string;
  };
  galleryPhotos: GalleryPhoto[];
  /** Homepage “Four Pillars” cards (image + copy). */
  homePillars: readonly HomePillar[];
  /** Headings above the pillars grid. */
  homePillarsHeading: {
    eyebrow: string;
    title: string;
  };
  homeProjects: readonly string[];
  homeStories: readonly string[];
  aboutStoryImages: readonly string[];
  projectImages: readonly string[];
  storyImages: readonly string[];
  founderTimelineImages: readonly string[];
};
