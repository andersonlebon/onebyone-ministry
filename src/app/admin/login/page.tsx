"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminLogin from "@/site/app/admin/AdminLogin";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("obom_admin_auth") === "true") {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  return <AdminLogin onLogin={() => router.push("/admin/dashboard")} />;
}
