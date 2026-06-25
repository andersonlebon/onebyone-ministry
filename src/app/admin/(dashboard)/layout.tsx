import type { Metadata } from "next";

import { listDonations } from "@/lib/db/donations";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPaymentEnvStatus } from "@/lib/donate/payment-env";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import AdminDashboardLayout from "@/site/app/admin/AdminDashboardLayout";

/** Admin uses auth + server actions; never statically cache with stale action IDs. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const [media, content, donations, paymentEnv] = await Promise.all([
    getPublicMediaBundle(),
    getSiteContentBundle(),
    isDatabaseConfigured() ? listDonations().catch(() => []) : Promise.resolve([]),
    Promise.resolve(getPaymentEnvStatus()),
  ]);

  return (
    <AdminDashboardLayout
      initialMedia={media}
      initialContent={content}
      initialDonations={donations}
      paymentEnv={paymentEnv}
    >
      {children}
    </AdminDashboardLayout>
  );
}
