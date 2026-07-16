import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
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
  const [{ media, version, albums }, content] = await Promise.all([
    getPublicMediaBundle(),
    getSiteContentBundle(),
  ]);

  return (
    <MediaProvider media={media} version={version} albums={albums}>
      <SiteContentProvider content={content}>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <NewsletterPopup />
        </div>
      </SiteContentProvider>
    </MediaProvider>
  );
}
