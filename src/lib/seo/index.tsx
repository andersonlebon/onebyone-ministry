import type { Metadata } from "next";

import { EMPTY_IMAGE } from "@/lib/media/placeholders";
import { siteConfig } from "@/lib/site";
import type { Post, SiteSettings } from "@/lib/site-content/types";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const titleTemplate = `%s | ${siteConfig.name}`;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const STATIC_OG_PATHS: Record<string, string> = {
  "/": "/og/home",
  "/about": "/og/about",
  "/projects": "/og/projects",
  "/photos": "/og/photos",
  "/videos": "/og/videos",
  "/stories": "/og/stories",
  "/donate": "/og/donate",
  "/contact": "/og/contact",
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getCanonicalSiteUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parseContentDate(value: string | null | undefined) {
  if (!value?.trim()) return undefined;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed);
}

export function isIndexableStorySlug(slug: string) {
  return slug.length >= 3 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function isUsableOgImage(value: string | null | undefined) {
  const image = value?.trim() ?? "";
  if (!image) return false;
  if (image === EMPTY_IMAGE || image.endsWith("/empty.svg") || image.endsWith(".svg")) {
    return false;
  }
  if (image.startsWith("data:")) return false;
  if (image.startsWith("/")) return true;
  try {
    const url = new URL(image);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ogImagePathFor(path: string) {
  return STATIC_OG_PATHS[path] ?? "/opengraph-image";
}

function shouldIndexPublicPages() {
  return process.env.VERCEL_ENV !== "preview";
}

function verificationMetadata(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  authors,
  index = true,
  imageAlt,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  index?: boolean;
  imageAlt?: string;
}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const url = absoluteUrl(path);
  const ogPath = image ?? ogImagePathFor(path);
  const imageUrl = absoluteUrl(ogPath);
  const alt = imageAlt ?? `${pageTitle} preview`;
  const indexable = index && shouldIndexPublicPages();
  const ogImage = {
    url: imageUrl,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    type: "image/png" as const,
    alt,
  };

  return {
    title: title
      ? { absolute: pageTitle, template: titleTemplate }
      : { default: siteConfig.name, template: titleTemplate },
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    verification: verificationMetadata(),
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [ogImage],
      locale: "en_US",
      type,
      ...(type === "article"
        ? {
            publishedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  };
}

function isPublicProfileUrl(value: string) {
  const href = value.trim();
  if (!href) return false;
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "") || "/";
    if (
      (host === "facebook.com" || host === "instagram.com" || host === "youtube.com") &&
      path === "/"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function organizationJsonLd(settings?: Partial<SiteSettings>) {
  const email = settings?.contactEmail?.trim() || siteConfig.email;
  const phone = settings?.contactPhone?.trim();
  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.youtubeUrl,
  ].filter((value): value is string => Boolean(value && isPublicProfileUrl(value)));

  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${absoluteUrl("/")}#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: absoluteUrl("/"),
    email,
    ...(phone ? { telephone: phone } : {}),
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logo),
    },
    image: absoluteUrl("/opengraph-image"),
    areaServed: ["United States", "Democratic Republic of the Congo"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "en-US",
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

export function articleJsonLd(post: Post) {
  const url = absoluteUrl(`/stories/${post.slug}`);
  const published = parseContentDate(post.date);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: url,
    url,
    image: absoluteUrl(`/og/stories/${post.slug ?? ""}`),
    ...(published ? { datePublished: published.toISOString() } : {}),
    author: {
      "@type": "Person",
      name: post.author || siteConfig.name,
    },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
