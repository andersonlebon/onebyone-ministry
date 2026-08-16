import assert from "node:assert/strict";

import {
  absoluteUrl,
  articleJsonLd,
  createMetadata,
  isIndexableStorySlug,
  isUsableOgImage,
  ogImagePathFor,
  organizationJsonLd,
  parseContentDate,
} from "@/lib/seo";
import type { Post } from "@/lib/site-content/types";

const previous = process.env.NEXT_PUBLIC_SITE_URL;
process.env.NEXT_PUBLIC_SITE_URL = "https://onebyoneministries.org";

assert.equal(absoluteUrl("/about"), "https://www.onebyoneministries.org/about");
assert.equal(
  absoluteUrl("https://xyz.supabase.co/storage/v1/object/public/media/story.jpg"),
  "https://xyz.supabase.co/storage/v1/object/public/media/story.jpg"
);
assert.equal(ogImagePathFor("/donate"), "/og/donate");
assert.equal(isIndexableStorySlug("t"), false);
assert.equal(isIndexableStorySlug("field-update"), true);
assert.equal(isUsableOgImage("/assets/placeholders/empty.svg"), false);
assert.equal(isUsableOgImage("/assets/brand-transparent/6-web.png"), true);
assert.ok(parseContentDate("August 13, 2026"));

const metadata = createMetadata({
  title: "About",
  description: "About the ministry.",
  path: "/about",
});
assert.equal(metadata.openGraph?.url, "https://www.onebyoneministries.org/about");
const ogImages = metadata.openGraph?.images;
const firstImage = Array.isArray(ogImages) ? ogImages[0] : ogImages;
const firstImageUrl =
  typeof firstImage === "string" || firstImage instanceof URL
    ? String(firstImage)
    : firstImage && typeof firstImage === "object" && "url" in firstImage
      ? String(firstImage.url)
      : undefined;
assert.equal(firstImageUrl, "https://www.onebyoneministries.org/og/about");

const org = organizationJsonLd({
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://www.instagram.com/onebyone",
  youtubeUrl: "",
  contactEmail: "hello@onebyoneministries.org",
  contactPhone: "",
});
assert.deepEqual(org.sameAs, ["https://www.instagram.com/onebyone"]);
assert.equal("telephone" in org, false);

const post: Post = {
  id: "1",
  slug: "hope-in-congo",
  title: "Hope in Congo",
  excerpt: "A field update.",
  body: "Full story",
  category: "Updates",
  author: "Field Team",
  date: "August 13, 2026",
  img: "https://example.supabase.co/storage/v1/object/public/media/story.jpg",
  published: true,
};
const article = articleJsonLd(post);
assert.equal(article.url, "https://www.onebyoneministries.org/stories/hope-in-congo");
assert.equal(article.image, "https://www.onebyoneministries.org/og/stories/hope-in-congo");

if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
else process.env.NEXT_PUBLIC_SITE_URL = previous;

console.log("PASS SEO canonical URLs, social cards, slugs, and JSON-LD");
