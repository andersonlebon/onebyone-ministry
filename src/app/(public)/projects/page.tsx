import { createMetadata } from "@/lib/seo";
import ProjectsPage from "@/site/app/pages/ProjectsPage";

export const metadata = createMetadata({
  title: "Projects",
  description:
    "Education, entrepreneurship, and discipleship projects bringing lasting change to communities in the Democratic Republic of Congo.",
  path: "/projects"
});

export default function Page() {
  return <ProjectsPage />;
}
