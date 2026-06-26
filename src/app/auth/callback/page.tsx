"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { completeAuthFromUrl, stripAuthParamsFromUrl } from "@/lib/supabase/complete-auth-from-url";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const result = await completeAuthFromUrl(supabase, window.location);

      if (cancelled) return;

      if (result.status === "success") {
        stripAuthParamsFromUrl();
        router.replace(result.next);
        router.refresh();
        return;
      }

      if (result.status === "error") {
        setMessage(result.message);
        stripAuthParamsFromUrl();
        router.replace(`/admin/login?error=auth`);
        return;
      }

      router.replace("/admin/login?error=auth");
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
