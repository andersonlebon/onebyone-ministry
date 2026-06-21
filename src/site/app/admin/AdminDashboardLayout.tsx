"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AdminShell from "@/site/app/admin/AdminShell";
import { SiteStoreProvider } from "@/site/lib/siteStore";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (!isSupabaseConfigured()) {
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
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        const allowed = isAdminUser(user);
        setAuthed(allowed);
        setReady(true);
        if (!allowed) {
          router.replace("/admin/login");
        }
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const allowed = isAdminUser(session?.user);
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0ea]">
        <div className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SiteStoreProvider>
      <AdminShell onLogout={handleLogout}>{children}</AdminShell>
    </SiteStoreProvider>
  );
}
