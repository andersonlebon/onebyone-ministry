"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isStaffUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import { adminDashboardUrl } from "@/lib/site-url";
import AdminLogin from "@/site/app/admin/AdminLogin";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectIfAuthed() {
      if (!isSupabaseConfigured()) {
        if (isDemoContentEnabled() && localStorage.getItem("obom_admin_auth") === "true") {
          router.replace("/admin/dashboard");
        }
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isStaffUser(user)) {
        window.location.assign(adminDashboardUrl(window.location.origin));
      }
    }

    void redirectIfAuthed();
  }, [router]);

  return (
    <AdminLogin
      onLogin={() => {
        window.location.assign(adminDashboardUrl(window.location.origin));
      }}
    />
  );
}
