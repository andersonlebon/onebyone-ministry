import { createMetadata } from "@/lib/seo";
import VideosPage from "@/site/app/pages/VideosPage";

export const metadata = createMetadata({
  title: "Videos",
  description:
    "Documentaries and field updates showing the work of One By One Ministries in the Democratic Republic of Congo.",
  path: "/videos"
});

export default function Page() {
  return <VideosPage />;
}
