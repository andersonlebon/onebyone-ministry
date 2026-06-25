import { galleryPhotos, localImages, ministryVideos, storyImages } from "@/content/media";

export const defaultSiteSettings = {
  heroHeadline: "Bringing Hope, Education, and the Love of Christ One By One",
  heroSubheadline:
    "Transforming communities in the Democratic Republic of Congo through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
  missionStatement:
    "One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship. We seek to change the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God.",
  donatePageHeadline: "Give to Change a Life in Congo",
  contactEmail: "contact@onebyoneministries.org",
  contactPhone: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
} as const;

export const defaultPosts = [
  {
    id: "1",
    title: "How One School Changed a Whole Village",
    excerpt: "When Amara received her first textbook at 11, she said it was the most beautiful thing she'd ever seen.",
    body: "Full story body goes here...",
    category: "Education",
    author: "Sarah M.",
    date: "May 28, 2025",
    img: storyImages[0],
    published: true,
  },
  {
    id: "2",
    title: "Pastor Thomas's Testimony",
    excerpt: "One discipleship meeting sparked a revival reaching five surrounding villages.",
    body: "Full story body goes here...",
    category: "Discipleship",
    author: "Emmanuel T.",
    date: "April 14, 2025",
    img: storyImages[1],
    published: true,
  },
  {
    id: "3",
    title: "Mamas Building a Future",
    excerpt: "28 women graduated from the Cohort, now running businesses.",
    body: "Full story body goes here...",
    category: "Entrepreneurship",
    author: "Jonathan K.",
    date: "March 3, 2025",
    img: storyImages[2],
    published: true,
  },
] as const;

export const defaultProjects = [
  {
    id: "1",
    title: "Rural School Building Initiative",
    category: "Education",
    status: "Active" as const,
    desc: "Constructing classrooms for 200+ children.",
    fullDesc: "Full description...",
    img: localImages.education,
    location: "Kinshasa Province",
    year: "2024–2025",
    impact: "200+ children",
  },
  {
    id: "2",
    title: "Women's Entrepreneurship Cohort",
    category: "Entrepreneurship",
    status: "Active" as const,
    desc: "12-week skills program for 30 women.",
    fullDesc: "Full description...",
    img: localImages.entrepreneurship,
    location: "Kasai Province",
    year: "2023–Ongoing",
    impact: "90+ graduates",
  },
  {
    id: "3",
    title: "Village Pastoral Training",
    category: "Discipleship",
    status: "Active" as const,
    desc: "Equipping rural pastors with theological education.",
    fullDesc: "Full description...",
    img: localImages.discipleship,
    location: "Multiple Provinces",
    year: "2021–Ongoing",
    impact: "45+ pastors",
  },
] as const;

export const defaultVideos = ministryVideos.map((v, i) => ({
  id: String(i + 1),
  youtubeId: v.id,
  title: v.title,
  category: v.category,
  duration: v.duration || "—",
  thumb: v.thumb,
}));

export const defaultGallerySeed = galleryPhotos.map((p) => ({
  path: `seed/${p.src.replace(/^\//, "")}`,
  publicUrl: p.src,
  alt: p.alt,
  category: p.category,
  folder: "photos" as const,
}));

export const defaultProjectMediaSeed = [
  {
    path: "seed/projects/education.jpg",
    publicUrl: localImages.education,
    alt: "Education project",
    category: "Education",
    folder: "projects" as const,
  },
  {
    path: "seed/projects/entrepreneurship.jpg",
    publicUrl: localImages.entrepreneurship,
    alt: "Entrepreneurship project",
    category: "Entrepreneurship",
    folder: "projects" as const,
  },
  {
    path: "seed/projects/discipleship.jpg",
    publicUrl: localImages.discipleship,
    alt: "Discipleship project",
    category: "Discipleship",
    folder: "projects" as const,
  },
];

export const defaultVideoThumbSeed = ministryVideos.map((v) => ({
  path: `seed/videos/${v.id}.jpg`,
  publicUrl: v.thumb,
  alt: v.title,
  category: v.category,
  folder: "videos" as const,
}));
