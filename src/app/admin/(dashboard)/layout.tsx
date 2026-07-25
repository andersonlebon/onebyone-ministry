import type { Metadata } from "next";

import { listDonations } from "@/lib/db/donations";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPaymentEnvStatus } from "@/lib/donate/payment-env";
import { getPublicMediaBundle, getPlaceholderMediaBundle } from "@/lib/media/resolve";
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
  const mediaFallback = {
    media: getPlaceholderMediaBundle(),
    version: null as number | null,
    albums: [] as Array<{ id: string; name: string; slug: string }>,
  };

  // Never let a DB blip crash the admin RSC tree (that produced the red
  // "An error occurred in the Server Components render" banner after album deletes).
  let media = mediaFallback.media;
  let version = mediaFallback.version;
  let albums = mediaFallback.albums;
  let content = contentFallback;
  let donations: Awaited<ReturnType<typeof listDonations>> = [];
  const paymentEnv = getPaymentEnvStatus();

  try {
    const [mediaPayload, contentPayload, donationRows] = await Promise.all([
      withTimeout(getPublicMediaBundle(), 10_000, mediaFallback),
      withTimeout(getSiteContentBundle(), 10_000, contentFallback),
      isDatabaseConfigured()
        ? withTimeout(listDonations().catch(() => []), 5_000, [])
        : Promise.resolve([]),
    ]);
    media = mediaPayload.media;
    version = mediaPayload.version;
    albums = mediaPayload.albums;
    content = contentPayload;
    donations = donationRows;
  } catch (error) {
    console.error("[admin-layout] Failed to load dashboard data; using fallbacks:", error);
  }

  return (
    <AdminDashboardLayout
      initialMedia={media}
      initialMediaVersion={version}
      initialAlbums={albums}
      initialContent={content}
      initialDonations={donations}
      paymentEnv={paymentEnv}
    >
      {children}
    </AdminDashboardLayout>
  );
}
