"use client";

import { useEffect, useState } from "react";

import { isStaffUser, needsInvitePasswordSetup } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import {
  completeAuthFromUrl,
  resolveAuthNextPath,
  stripAuthParamsFromUrl,
} from "@/lib/supabase/complete-auth-from-url";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const result = await completeAuthFromUrl(supabase, window.location);

      if (cancelled) return;

      if (result.status === "success") {
        stripAuthParamsFromUrl();
        window.location.assign(result.next);
        return;
      }

      if (result.status === "error") {
        stripAuthParamsFromUrl();
        window.location.assign("/admin/login?error=auth");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user && isStaffUser(session.user)) {
        const next = needsInvitePasswordSetup(session.user)
          ? "/admin/accept-invite"
          : resolveAuthNextPath(window.location.search, window.location.hash);
        window.location.assign(next);
        return;
      }

      setMessage("Could not complete sign-in. Redirecting...");
      window.location.assign("/admin/login?error=auth");
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
