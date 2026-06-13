import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

const routes = ["/", "/about", "/projects", "/photos", "/videos", "/stories", "/donate", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8
  }));
}
