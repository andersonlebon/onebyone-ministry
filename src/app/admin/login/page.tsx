"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isStaffUser } from "@/lib/supabase/admin";
import { completeAuthFromUrl, stripAuthParamsFromUrl } from "@/lib/supabase/complete-auth-from-url";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import { adminDashboardUrl } from "@/lib/site-url";
import AdminLogin from "@/site/app/admin/AdminLogin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        if (isDemoContentEnabled() && localStorage.getItem("obom_admin_auth") === "true") {
          router.replace("/admin/dashboard");
        }
        if (!cancelled) setAuthReady(true);
        return;
      }

      const supabase = createClient();
      const fromUrl = await completeAuthFromUrl(supabase, window.location);

      if (cancelled) return;

      if (fromUrl.status === "success") {
        stripAuthParamsFromUrl();
        router.replace(fromUrl.next);
        router.refresh();
        return;
      }

      if (fromUrl.status === "error") {
        stripAuthParamsFromUrl();
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (isStaffUser(user)) {
        const needsInviteSetup =
          user?.user_metadata?.password_set !== true &&
          (user?.app_metadata?.role === "admin" || user?.app_metadata?.role === "viewer");

        if (needsInviteSetup) {
          router.replace("/admin/accept-invite");
        } else {
          window.location.assign(adminDashboardUrl(window.location.origin));
        }
        return;
      }

      setAuthReady(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a2a1f]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLogin
      onLogin={() => {
        window.location.assign(adminDashboardUrl(window.location.origin));
      }}
    />
  );
}
