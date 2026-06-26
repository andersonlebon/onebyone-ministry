import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { getPublishedPosts } from "@/lib/site-content/posts";

const routes = ["/", "/about", "/projects", "/photos", "/videos", "/stories", "/donate", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "/" ? 1 : 0.8,
  }));

  try {
    const { posts } = await getSiteContentBundle();
    const storyEntries = getPublishedPosts(posts).map((post) => ({
      url: absoluteUrl(`/stories/${post.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticEntries, ...storyEntries];
  } catch {
    return staticEntries;
  }
}
