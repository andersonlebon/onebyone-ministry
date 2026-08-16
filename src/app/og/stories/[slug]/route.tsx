import { renderOgCard } from "@/lib/seo/og-card";
import { getPostBySlug } from "@/lib/site-content/posts";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { posts } = await getSiteContentBundle();
  const post = getPostBySlug(posts, slug);

  if (!post) {
    return renderOgCard({
      title: "Story Not Found",
      subtitle: siteConfig.name,
    });
  }

  return renderOgCard({
    title: post.title,
    subtitle: post.excerpt || siteConfig.tagline,
    imageUrl: post.img,
  });
}
