import { createMetadata } from "@/lib/seo";
import HomePage from "@/site/app/pages/HomePage";

export const metadata = createMetadata({
  description:
    "One By One Ministries rebuilds communities in the Democratic Republic of Congo through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
  path: "/"
});

export default function Page() {
  return <HomePage />;
}
