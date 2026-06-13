import { createMetadata } from "@/lib/seo";
import AboutPage from "@/site/app/pages/AboutPage";

export const metadata = createMetadata({
  title: "About",
  description:
    "The story, vision, and leadership behind One By One Ministries — a non-profit transforming communities across the DRC.",
  path: "/about"
});

export default function Page() {
  return <AboutPage />;
}
