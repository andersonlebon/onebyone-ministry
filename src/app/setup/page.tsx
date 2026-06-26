import type { Metadata } from "next";

import SetupPage from "@/site/app/pages/SetupPage";

/** Never statically prerender: old builds cached a redirect to / when setup was complete. */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Project Setup",
  robots: { index: false, follow: false },
};

export default function SetupRoutePage() {
  return <SetupPage />;
}
