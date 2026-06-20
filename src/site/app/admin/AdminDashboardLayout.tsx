"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminShell from "@/site/app/admin/AdminShell";
import { SiteStoreProvider } from "@/site/lib/siteStore";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const isAuthed = localStorage.getItem("obom_admin_auth") === "true";
    setAuthed(isAuthed);
    setReady(true);
    if (!isAuthed) {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("obom_admin_auth");
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
