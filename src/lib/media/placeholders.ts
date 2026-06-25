import type { GalleryPhoto, SiteMediaBundle } from "./types";

function buildPhotos(
  folder: string,
  count: number,
  category: GalleryPhoto["category"],
  altPrefix: string,
  idStart: number
): GalleryPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: idStart + i,
    src: `/assets/${folder}/${i + 1}.jpg`,
    alt: `${altPrefix} ${i + 1}`,
    category,
    h: 480 + ((i * 37) % 280),
  }));
}

/** Local `/assets/...` paths used only before project setup completes. */
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

  const localImages = {
    education: "/assets/distribution-23/1.jpg",
    educationAlt: "/assets/distribution-24/3.jpg",
    entrepreneurship: "/assets/photos/4.jpg",
    discipleship: "/assets/photos/8.jpg",
    community: "/assets/photos/2.jpg",
    communityAlt: "/assets/distribution-25/5.jpg",
    outreach: "/assets/website-use/5.jpg",
    water: "/assets/website-use/6.jpg",
    worship: "/assets/website-use/7.jpg",
    leaderOne: "/assets/brand/14.jpg",
    leaderTwo: "/assets/brand/15.jpg",
    leaderThree: "/assets/brand/16.jpg",
    testimonialOne: "/assets/photos/9.jpg",
    testimonialTwo: "/assets/photos/10.jpg",
    storyHero: "/assets/brand/23-hero.jpg",
    donateHero: "/assets/distribution-25/8.jpg",
    contactHero: "/assets/website-use/2.jpg",
  };

  const ministryVideos = [
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
  ];

  const galleryPhotos = [
    ...buildPhotos("photos", 13, "Community", "One By One Ministries photo", 1),
    ...buildPhotos("distribution-23", 18, "Outreach", "Distribution 2023", 14),
    ...buildPhotos("distribution-24", 13, "Outreach", "Distribution 2024", 32),
    ...buildPhotos("distribution-25", 13, "Outreach", "Distribution 2025", 45),
  ];

  return {
    brandAssets,
    websiteUseImages,
    localImages,
    ministryVideos,
    featuredVideo: {
      id: ministryVideos[0].id,
      title: ministryVideos[0].title,
      desc: "Watch our first annual school distribution — bringing education and hope to children in rural Congo.",
      duration: "",
      category: ministryVideos[0].category,
      thumb: ministryVideos[0].thumb,
    },
    galleryPhotos,
    homePillars: [
      { key: "education", img: localImages.education },
      { key: "entrepreneurship", img: localImages.entrepreneurship },
      { key: "discipleship", img: localImages.worship },
      { key: "community", img: localImages.water },
    ],
    homeProjects: [localImages.education, localImages.entrepreneurship, localImages.discipleship],
    homeStories: [localImages.educationAlt, localImages.worship, localImages.entrepreneurship],
    aboutStoryImages: [localImages.education, localImages.worship, localImages.community],
    projectImages: [
      localImages.education,
      localImages.entrepreneurship,
      localImages.discipleship,
      localImages.water,
      localImages.worship,
      localImages.communityAlt,
    ],
    storyImages: [
      localImages.education,
      localImages.worship,
      localImages.entrepreneurship,
      localImages.water,
      localImages.community,
      localImages.outreach,
      localImages.communityAlt,
    ],
    founderTimelineImages: [
      "/assets/photos/1.jpg",
      "/assets/photos/2.jpg",
      "/assets/website-use/1.jpg",
      "/assets/brand/23.jpg",
      "/assets/distribution-23/1.jpg",
      "/assets/photos/4.jpg",
      "/assets/website-use/7.jpg",
      "/assets/distribution-25/1.jpg",
    ],
  };
}

export const PLACEHOLDER_MEDIA = buildPlaceholderMediaBundle();
