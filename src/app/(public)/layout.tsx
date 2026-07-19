import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";
import { canInlineEditAction } from "@/app/actions/admin-session";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
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

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ media, version, albums }, content, canEdit] = await Promise.all([
    getPublicMediaBundle(),
    getSiteContentBundle(),
    canInlineEditAction(),
  ]);

  return (
    <MediaProvider media={media} version={version} albums={albums}>
      <SiteContentProvider content={content}>
        <AdminEditProvider canEdit={canEdit}>
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
