import type { Metadata } from "next";

import AdminDashboardLayout from "@/site/app/admin/AdminDashboardLayout";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
