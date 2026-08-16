import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";
import { canInlineEditAction } from "@/app/actions/admin-session";
import { getPublicMediaBundle, getPlaceholderMediaBundle } from "@/lib/media/resolve";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { getDefaultSiteContentBundle } from "@/lib/site-content/defaults";
import { withTimeout } from "@/lib/server/with-timeout";
import type { SiteContentBundle } from "@/lib/site-content/types";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { AdminEditProvider } from "@/site/lib/adminEditContext";
import { MediaProvider } from "@/site/lib/mediaContext";
import { SiteContentProvider } from "@/site/lib/siteContentContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function headers() {
  return {
    "Cache-Control": "no-store, must-revalidate",
  };
}

async function loadSiteContentReliable(): Promise<SiteContentBundle> {
  const first = await withTimeout(getSiteContentBundle(), 8_000, null);
  if (first) return first;

  // Retry once — empty fallback previously made saved projects look “gone”.
  const second = await withTimeout(getSiteContentBundle(), 8_000, null);
  if (second) return second;

  console.error("[public-layout] site content timed out twice; using settings-only fallback");
  return getDefaultSiteContentBundle();
}

async function loadPublicMediaReliable() {
  const empty = {
    media: getPlaceholderMediaBundle(),
    version: null as number | null,
    albums: [] as Array<{ id: string; name: string; slug: string }>,
  };

  // Retry once — a single timeout previously made albums look wiped after admin deletes.
  const first = await withTimeout(getPublicMediaBundle(), 10_000, null);
  if (first) return first;

  const second = await withTimeout(getPublicMediaBundle(), 10_000, null);
  if (second) return second;

  console.error("[public-layout] media/albums timed out twice; using empty gallery fallback");
  return empty;
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ media, version, albums }, content, canEdit] = await Promise.all([
    loadPublicMediaReliable(),
    loadSiteContentReliable(),
    withTimeout(canInlineEditAction(), 2_000, false),
  ]);

  return (
    <MediaProvider media={media} version={version} albums={albums}>
      <SiteContentProvider content={content}>
        <AdminEditProvider canEdit={canEdit}>
          <JsonLd data={organizationJsonLd(content.settings)} />
          <JsonLd data={websiteJsonLd()} />
          <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            {canEdit ? (
              <div
                className="text-center text-xs font-semibold py-2 text-white"
                style={{ backgroundColor: "#6E9277" }}
              >
                Admin mode: use the Edit buttons on each section. Full dashboard still available at /admin.
              </div>
            ) : null}
            <main className="flex-1">{children}</main>
            <Footer />
            <NewsletterPopup />
          </div>
        </AdminEditProvider>
      </SiteContentProvider>
    </MediaProvider>
  );
}
