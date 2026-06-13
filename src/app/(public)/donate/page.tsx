import { createMetadata } from "@/lib/seo";
import DonatePage from "@/site/app/pages/DonatePage";

export const metadata = createMetadata({
  title: "Donate",
  description:
    "Give to change a life in Congo. Your tax-deductible gift funds education, entrepreneurship, and discipleship on the field.",
  path: "/donate"
});

export default function Page() {
  return <DonatePage />;
}
