"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isStaffUser, needsInvitePasswordSetup } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import AdminShell from "@/site/app/admin/AdminShell";
import { SiteStoreProvider } from "@/site/lib/siteStore";
import { MediaProvider } from "@/site/lib/mediaContext";
import type { SiteMediaBundle } from "@/lib/media/types";
import type { Donation, SiteContentBundle } from "@/lib/site-content/types";
import type { PaymentEnvStatus } from "@/lib/donate/payment-env-types";
import { ReadinessEnvProvider } from "@/site/lib/readinessEnvContext";

export default function AdminDashboardLayout({
  children,
  initialMedia,
  initialMediaVersion = null,
  initialContent,
  initialDonations = [],
  paymentEnv = { stripeKeys: false, stripeWebhook: false },
}: {
  children: React.ReactNode;
  initialMedia: SiteMediaBundle;
  initialMediaVersion?: number | null;
  initialContent: SiteContentBundle;
  initialDonations?: Donation[];
  paymentEnv?: PaymentEnvStatus;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        if (!isDemoContentEnabled()) {
          if (!cancelled) {
            setAuthed(false);
            setReady(true);
            router.replace("/admin/login");
          }
          return;
        }
        const isAuthed = localStorage.getItem("obom_admin_auth") === "true";
        if (!cancelled) {
          setAuthed(isAuthed);
          setReady(true);
          if (!isAuthed) {
            router.replace("/admin/login");
          }
        }
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        const allowed = isStaffUser(session?.user);
        if (!allowed) {
          setReady(true);
          router.replace("/admin/login");
          return;
        }

        if (needsInvitePasswordSetup(session?.user)) {
          window.location.assign("/admin/accept-invite");
          return;
        }

        setAuthed(true);
        setReady(true);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        const allowed = isStaffUser(nextSession?.user);
        setAuthed(allowed);
        if (!allowed) {
          router.replace("/admin/login");
          return;
        }
        if (needsInvitePasswordSetup(nextSession?.user)) {
          router.replace("/admin/accept-invite");
        }
      });

      return () => subscription.unsubscribe();
    }

    let unsubscribe: (() => void) | undefined;

    void checkAuth().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    } else {
      localStorage.removeItem("obom_admin_auth");
    }
    router.replace("/admin/login");
  };

  if (!ready || !authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ReadinessEnvProvider value={paymentEnv}>
      <MediaProvider media={initialMedia} version={initialMediaVersion}>
        <SiteStoreProvider initialData={{ ...initialContent, donations: initialDonations }}>
          <AdminShell onLogout={handleLogout}>{children}</AdminShell>
        </SiteStoreProvider>
      </MediaProvider>
    </ReadinessEnvProvider>
  );
}
