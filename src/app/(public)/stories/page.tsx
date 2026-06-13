import { createMetadata } from "@/lib/seo";
import StoriesPage from "@/site/app/pages/StoriesPage";

export const metadata = createMetadata({
  title: "Stories & Updates",
  description:
    "Field stories, testimonies, and ministry updates from One By One Ministries across the DRC.",
  path: "/stories"
});

export default function Page() {
  return <StoriesPage />;
}
