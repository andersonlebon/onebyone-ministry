import { createMetadata } from "@/lib/seo";
import StoriesPage from "@/site/app/pages/StoriesPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = createMetadata({
  title: "Stories & Updates",
  description:
    "Field stories, testimonies, and ministry updates from One By One Ministries across the DRC.",
  path: "/stories"
});

export default function Page() {
  return <StoriesPage />;
}
