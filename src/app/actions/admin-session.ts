"use server";

import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** True when the current browser session can edit public-site content inline. */
export async function canInlineEditAction(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
    if (!result) return false;
    return isAdminUser(result.data.user);
  } catch {
    return false;
  }
}
