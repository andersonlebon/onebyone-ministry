import { renderOgCard } from "@/lib/seo/og-card";
import { getOgHeroForPage, isOgPageKey, OG_PAGE_COPY } from "@/lib/seo/og-pages";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  if (!isOgPageKey(page)) {
    return new Response("Not found", { status: 404 });
  }

  const copy = OG_PAGE_COPY[page];
  const imageUrl = await getOgHeroForPage(page);
  return renderOgCard({
    title: copy.title,
    subtitle: copy.subtitle,
    imageUrl,
  });
}
