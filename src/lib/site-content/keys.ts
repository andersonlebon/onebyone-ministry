export const SITE_CONTENT_KEYS = {
  settings: "settings",
  posts: "posts",
  projects: "projects",
  videos: "videos",
  finance: "finance",
} as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[keyof typeof SITE_CONTENT_KEYS];
