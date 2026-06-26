import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { getPostBySlug } from "@/lib/site-content/posts";
import { createMetadata } from "@/lib/seo";
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
    });
  }

  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/stories/${post.slug}`,
    image: post.img || "/opengraph-image",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { posts } = await getSiteContentBundle();
  const post = getPostBySlug(posts, slug);

  if (!post) {
    notFound();
  }

  return <StoryPostPage post={post} />;
}
