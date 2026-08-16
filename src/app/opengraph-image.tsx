import { renderOgCard } from "@/lib/seo/og-card";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.name} ministry website preview`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgCard({
    title: siteConfig.name,
    subtitle: siteConfig.tagline,
  });
}
