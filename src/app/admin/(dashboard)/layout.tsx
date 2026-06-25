import type { Metadata } from "next";

import { getPublicMediaBundle } from "@/lib/media/resolve";
import AdminDashboardLayout from "@/site/app/admin/AdminDashboardLayout";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const media = await getPublicMediaBundle();
  return <AdminDashboardLayout initialMedia={media}>{children}</AdminDashboardLayout>;
}
