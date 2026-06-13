import { createMetadata } from "@/lib/seo";
import ContactPage from "@/site/app/pages/ContactPage";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Get in touch with One By One Ministries — questions, partnerships, and prayer requests welcome.",
  path: "/contact"
});

export default function Page() {
  return <ContactPage />;
}
