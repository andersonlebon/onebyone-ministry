import Navbar from "@/site/app/components/layout/Navbar";
import Footer from "@/site/app/components/layout/Footer";
import NewsletterPopup from "@/site/app/components/shared/NewsletterPopup";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <NewsletterPopup />
    </div>
  );
}
