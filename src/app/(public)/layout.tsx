import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { MediaProvider } from "@/site/lib/mediaContext";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const media = await getPublicMediaBundle();

  return (
    <MediaProvider media={media}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <NewsletterPopup />
      </div>
    </MediaProvider>
  );
}
