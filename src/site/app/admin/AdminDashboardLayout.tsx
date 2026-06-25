"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isStaffUser } from "@/lib/supabase/admin";
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
  initialContent,
  initialDonations = [],
  paymentEnv = { stripeKeys: false, stripeWebhook: false },
}: {
  children: React.ReactNode;
  initialMedia: SiteMediaBundle;
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
        setAuthed(allowed);
        setReady(true);
        if (!allowed) {
          router.replace("/admin/login");
          return;
        }
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        const allowed = isStaffUser(nextSession?.user);
        setAuthed(allowed);
        if (!allowed) {
          router.replace("/admin/login");
        }
      });

      return () => subscription.unsubscribe();
    }

    const cleanupPromise = checkAuth();

    return () => {
      cancelled = true;
      void cleanupPromise;
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
      <MediaProvider media={initialMedia}>
        <SiteStoreProvider initialData={{ ...initialContent, donations: initialDonations }}>
          <AdminShell onLogout={handleLogout}>{children}</AdminShell>
        </SiteStoreProvider>
      </MediaProvider>
    </ReadinessEnvProvider>
  );
}
