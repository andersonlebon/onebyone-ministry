import type { SiteSettings } from "@/lib/site-content/types";

export const defaultSiteSettings: SiteSettings = {
  heroHeadline: "Bringing Hope, Education, and the Love of Christ",
  heroHeadlineLines: [
    { text: "Bringing Hope, Education,", color: "default" },
    { text: "and the Love of Christ", color: "default" },
  ],
  heroSubheadline:
    "Transforming communities in the Democratic Republic of Congo through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
  missionStatement:
    "One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship. We seek to change the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God.",
  donatePageHeadline: "Partner With Us",
  contactEmail: "contact@onebyoneministries.org",
  contactPhone: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  /** Homepage impact strip */
  statCommunities: "3",
  statFamilies: "200+",
  statProjects: "4",
  statTeam: "10",
  statCommunitiesLabel: "Villages Served",
  statFamiliesLabel: "Families Reached",
  statProjectsLabel: "Projects",
  statTeamLabel: "Team in Congo",
  verseText:
    "…that you may be filled with all the fullness of God. Now to him who is able to do far more abundantly than all that we ask or think…",
  verseReference: "Ephesians 3:19–20",
  usaAddress: "",
  congoAddress: "",
};

/** Runtime no longer seeds demo content — client adds these. */
export const defaultPosts = [] as const;
export const defaultProjects = [] as const;
export const defaultVideos = [] as const;
export const defaultGallerySeed = [] as const;
export const defaultProjectMediaSeed = [] as const;
export const defaultVideoThumbSeed = [] as const;
