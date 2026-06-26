import type { Post } from "./types";

export function slugifyPostTitle(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "story";
}

export function normalizePost(post: Post, usedSlugs = new Set<string>()): Post {
  let slug = post.slug?.trim() || slugifyPostTitle(post.title);
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${slugifyPostTitle(post.title)}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);

  return {
    ...post,
    slug,
  };
}

export function normalizePosts(posts: Post[]): Post[] {
  const usedSlugs = new Set<string>();
  return posts.map((post) => normalizePost(post, usedSlugs));
}

export function getPublishedPosts(posts: Post[]) {
  return normalizePosts(posts).filter((post) => post.published);
}

export function getPostBySlug(posts: Post[], slug: string) {
  const normalized = normalizePosts(posts);
  return normalized.find((post) => post.slug === slug && post.published) ?? null;
}
