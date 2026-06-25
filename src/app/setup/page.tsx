import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isSetupComplete } from "@/lib/db/setup";
import { isProductionBuild } from "@/lib/runtime-env";
import SetupPage from "@/site/app/pages/SetupPage";

export const metadata: Metadata = {
  title: "Project Setup",
  robots: { index: false, follow: false },
};

export default async function SetupRoutePage() {
  if (isProductionBuild() && (await isSetupComplete())) {
    redirect("/");
  }

  return <SetupPage />;
}
