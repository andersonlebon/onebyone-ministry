"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isStaffUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isDemoContentEnabled } from "@/lib/runtime-env";
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
        router.replace("/admin/dashboard");
      }
    }

    void redirectIfAuthed();
  }, [router]);

  return <AdminLogin onLogin={() => router.push("/admin/dashboard")} />;
}
