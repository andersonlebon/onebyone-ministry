import type { Metadata } from "next";

import SetupPage from "@/site/app/pages/SetupPage";

export const metadata: Metadata = {
  title: "Project Setup",
  robots: { index: false, follow: false },
};

export default function SetupRoutePage() {
  return <SetupPage />;
}
