/** Client-provided brand assets (Brand Transparent zip.zip / Brand .zip) */
export const brandAssets = {
  logoDark: "/assets/brand-transparent/6.png",
  logoWhite: "/assets/brand-transparent/7.png",
  logoVertical: "/assets/brand-transparent/5.png",
} as const;

/** Client-provided website hero / section images (Website Use.zip) */
export const websiteUseImages = {
  hero: "/assets/website-use/1.png",
  about: "/assets/website-use/2.png",
  mission: "/assets/website-use/3.png",
  projects: "/assets/website-use/4.png",
  outreach: "/assets/website-use/5.png",
  community: "/assets/website-use/6.png",
  worship: "/assets/website-use/7.png",
} as const;

export function youtubeThumb(id: string, quality: "hq" | "max" = "hq") {
  return quality === "max"
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Client YouTube videos */
export const ministryVideos = [
  {
    id: "4RJ6FL4ubpI",
    title: "First Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: youtubeThumb("4RJ6FL4ubpI"),
    url: "https://www.youtube.com/watch?v=4RJ6FL4ubpI",
  },
  {
    id: "Jw04mxrMQm0",
    title: "Second Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: youtubeThumb("Jw04mxrMQm0"),
    url: "https://www.youtube.com/watch?v=Jw04mxrMQm0",
  },
  {
    id: "ChtKT8Yqcws",
    title: "Third Annual School Distribution",
    category: "Education",
    duration: "",
    thumb: youtubeThumb("ChtKT8Yqcws"),
    url: "https://www.youtube.com/watch?v=ChtKT8Yqcws",
  },
  {
    id: "uH--9x6HATU",
    title: "Water Project",
    category: "Community",
    duration: "",
    thumb: youtubeThumb("uH--9x6HATU"),
    url: "https://www.youtube.com/watch?v=uH--9x6HATU",
  },
] as const;

export const featuredVideo = {
  id: ministryVideos[0].id,
  title: ministryVideos[0].title,
  desc: "Watch our first annual school distribution — bringing education and hope to children in rural Congo.",
  duration: "",
  category: ministryVideos[0].category,
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
