import type { MetadataRoute } from "next";

import { isDatabaseConfigured } from "@/lib/db/config";
import { getSiteContentRow } from "@/lib/db/site-content";
import { SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
import { absoluteUrl, isIndexableStorySlug, parseContentDate } from "@/lib/seo";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import { getPublishedPosts } from "@/lib/site-content/posts";
import { getSiteContentBundle } from "@/lib/site-content/resolve";

const routes = ["/", "/about", "/projects", "/photos", "/videos", "/stories", "/donate", "/contact"];

async function latestContentUpdatedAt() {
  if (!isDatabaseConfigured()) return undefined;
  try {
    const [settings, media] = await Promise.all([
      getSiteContentRow(SITE_CONTENT_KEYS.settings),
      getSiteContentRow(SITE_MEDIA_CONTENT_KEY),
    ]);
    const dates = [settings?.updatedAt, media?.updatedAt].filter(
      (value): value is Date => value instanceof Date && !Number.isNaN(value.getTime())
    );
    if (dates.length === 0) return undefined;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await latestContentUpdatedAt();
  const staticEntries = routes.map((route) => ({
    url: absoluteUrl(route),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "/" ? 1 : 0.8,
  }));

  try {
    const { posts } = await getSiteContentBundle();
    const storyEntries = getPublishedPosts(posts)
      .filter((post) => isIndexableStorySlug(post.slug ?? ""))
      .map((post) => ({
        url: absoluteUrl(`/stories/${post.slug}`),
        ...(parseContentDate(post.date)
          ? { lastModified: parseContentDate(post.date) }
          : lastModified
            ? { lastModified }
            : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    return [...staticEntries, ...storyEntries];
  } catch {
    return staticEntries;
  }
}
