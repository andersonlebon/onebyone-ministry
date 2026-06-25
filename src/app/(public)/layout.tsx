import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { MediaProvider } from "@/site/lib/mediaContext";
import { SiteContentProvider } from "@/site/lib/siteContentContext";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [media, content] = await Promise.all([getPublicMediaBundle(), getSiteContentBundle()]);

  return (
    <MediaProvider media={media}>
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
