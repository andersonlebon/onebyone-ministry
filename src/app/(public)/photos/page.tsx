import { createMetadata } from "@/lib/seo";
import PhotosPage from "@/site/app/pages/PhotosPage";

export const metadata = createMetadata({
  title: "Photos",
  description:
    "A gallery of moments from the field — education, worship, community, and outreach across the DRC.",
  path: "/photos"
});

export default function Page() {
  return <PhotosPage />;
}
