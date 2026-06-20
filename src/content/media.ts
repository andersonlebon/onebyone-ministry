/** Client-provided brand assets (Brand Transparent zip.zip / Brand .zip) */
export const brandAssets = {
  logoDark: "/assets/brand-transparent/6-web.png",
  logoWhite: "/assets/brand-transparent/8-web.png",
  logoVertical: "/assets/brand-transparent/5-web.png",
  logoVerticalWhite: "/assets/brand-transparent/7-web.png",
} as const;

/** Client-provided website hero / section images (Website Use.zip) */
export const websiteUseImages = {
  hero: "/assets/brand/23-hero.jpg",
  about: "/assets/website-use/2.png",
  mission: "/assets/website-use/3.png",
  projects: "/assets/website-use/4.png",
  outreach: "/assets/website-use/5.png",
  community: "/assets/website-use/6.png",
  worship: "/assets/website-use/7.png",
} as const;

export const localImages = {
  education: "/assets/distribution-23/1.png",
  educationAlt: "/assets/distribution-24/3.png",
  entrepreneurship: "/assets/photos/4.png",
  discipleship: "/assets/photos/8.png",
  community: "/assets/photos/2.png",
  communityAlt: "/assets/distribution-25/5.png",
  outreach: "/assets/website-use/5.png",
  water: "/assets/website-use/6.png",
  worship: "/assets/website-use/7.png",
  leaderOne: "/assets/brand/14.png",
  leaderTwo: "/assets/brand/15.png",
  leaderThree: "/assets/brand/16.png",
  testimonialOne: "/assets/photos/9.png",
  testimonialTwo: "/assets/photos/10.png",
  storyHero: "/assets/brand/23-hero.jpg",
  donateHero: "/assets/distribution-25/8.png",
  contactHero: "/assets/website-use/2.png",
} as const;

/** Client YouTube videos */
export const ministryVideos = [
  {
    id: "4RJ6FL4ubpI",
    title: "First Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: "/assets/video-thumbs/video-school-1.jpg",
    url: "https://www.youtube.com/watch?v=4RJ6FL4ubpI",
  },
  {
    id: "Jw04mxrMQm0",
    title: "Second Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: "/assets/video-thumbs/video-school-2.jpg",
    url: "https://www.youtube.com/watch?v=Jw04mxrMQm0",
  },
  {
    id: "ChtKT8Yqcws",
    title: "Third Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: "/assets/video-thumbs/video-school-3.jpg",
    url: "https://www.youtube.com/watch?v=ChtKT8Yqcws",
  },
  {
    id: "uH--9x6HATU",
    title: "Water Project",
    category: "Community",
    duration: "",
    thumb: "/assets/video-thumbs/video-water-project.jpg",
    url: "https://www.youtube.com/watch?v=uH--9x6HATU",
  },
] as const;

export const featuredVideo = {
  id: ministryVideos[0].id,
  title: ministryVideos[0].title,
  desc: "Watch our first annual school distribution — bringing education and hope to children in rural Congo.",
  duration: "",
  category: ministryVideos[0].category,
  thumb: ministryVideos[0].thumb,
};

type PhotoEntry = {
  id: number;
  src: string;
  alt: string;
  category: "Education" | "Community" | "Worship" | "Outreach";
  h: number;
};

function buildPhotos(
  folder: string,
  count: number,
  category: PhotoEntry["category"],
  altPrefix: string,
  idStart: number
): PhotoEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: idStart + i,
    src: `/assets/${folder}/${i + 1}.png`,
    alt: `${altPrefix} ${i + 1}`,
    category,
    h: 480 + ((i * 37) % 280),
  }));
}

/** Client photo galleries (Our Photo's + Distribution 23/24/25 zips) */
export const galleryPhotos: PhotoEntry[] = [
  ...buildPhotos("photos", 13, "Community", "One By One Ministries photo", 1),
  ...buildPhotos("distribution-23", 18, "Outreach", "Distribution 2023", 14),
  ...buildPhotos("distribution-24", 13, "Outreach", "Distribution 2024", 32),
  ...buildPhotos("distribution-25", 13, "Outreach", "Distribution 2025", 45),
];

export const homePillars = [
  { key: "education", img: localImages.education },
  { key: "entrepreneurship", img: localImages.entrepreneurship },
  { key: "discipleship", img: localImages.worship },
  { key: "community", img: localImages.water },
] as const;

export const homeProjects = [
  localImages.education,
  localImages.entrepreneurship,
  localImages.discipleship,
] as const;

export const homeStories = [
  localImages.educationAlt,
  localImages.worship,
  localImages.entrepreneurship,
] as const;

export const aboutStoryImages = [
  localImages.education,
  localImages.worship,
  localImages.community,
] as const;

export const projectImages = [
  localImages.education,
  localImages.entrepreneurship,
  localImages.discipleship,
  localImages.water,
  localImages.worship,
  localImages.communityAlt,
] as const;

export const storyImages = [
  localImages.education,
  localImages.worship,
  localImages.entrepreneurship,
  localImages.water,
  localImages.community,
  localImages.outreach,
  localImages.communityAlt,
] as const;

export const founderTimelineImages = [
  "/assets/photos/1.png",
  "/assets/photos/2.png",
  "/assets/website-use/1.png",
  "/assets/brand/23.png",
  "/assets/distribution-23/1.png",
  "/assets/photos/4.png",
  "/assets/website-use/7.png",
  "/assets/distribution-25/1.png",
] as const;
