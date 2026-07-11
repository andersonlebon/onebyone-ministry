import type { Metadata } from "next";

import { listDonations } from "@/lib/db/donations";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPaymentEnvStatus } from "@/lib/donate/payment-env";
import { getPublicMediaBundle } from "@/lib/media/resolve";
import { getDefaultSiteContentBundle } from "@/lib/site-content/defaults";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { withTimeout } from "@/lib/server/with-timeout";
import AdminDashboardLayout from "@/site/app/admin/AdminDashboardLayout";

/** Admin uses auth + server actions; never statically cache with stale action IDs. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const contentFallback = getDefaultSiteContentBundle();

  const [{ media, version }, content, donations, paymentEnv] = await Promise.all([
    getPublicMediaBundle(),
    withTimeout(getSiteContentBundle(), 8_000, contentFallback),
    isDatabaseConfigured()
      ? withTimeout(listDonations().catch(() => []), 5_000, [])
      : Promise.resolve([]),
    Promise.resolve(getPaymentEnvStatus()),
  ]);

  return (
    <AdminDashboardLayout
      initialMedia={media}
      initialMediaVersion={version}
      initialContent={content}
      initialDonations={donations}
      paymentEnv={paymentEnv}
    >
      {children}
    </AdminDashboardLayout>
  );
}
