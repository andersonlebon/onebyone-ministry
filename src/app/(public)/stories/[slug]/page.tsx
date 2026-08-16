import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  articleJsonLd,
  breadcrumbJsonLd,
  createMetadata,
  JsonLd,
  parseContentDate,
} from "@/lib/seo";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { getPostBySlug } from "@/lib/site-content/posts";
import StoryPostPage from "@/site/app/pages/StoryPostPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = await getSiteContentBundle();
  const post = getPostBySlug(posts, slug);

  if (!post) {
    return createMetadata({
      title: "Story Not Found",
      description: "This story could not be found.",
      path: `/stories/${slug}`,
      index: false,
    });
  }

  const published = parseContentDate(post.date);

  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/stories/${post.slug}`,
    image: `/og/stories/${post.slug}`,
    imageAlt: post.title,
    type: "article",
    publishedTime: published?.toISOString(),
    authors: post.author ? [post.author] : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { posts } = await getSiteContentBundle();
  const post = getPostBySlug(posts, slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Stories", path: "/stories" },
          { name: post.title, path: `/stories/${post.slug}` },
        ])}
      />
      <StoryPostPage post={post} />
    </>
  );
}
