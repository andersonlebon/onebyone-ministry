"use server";

import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** True when the current browser session can edit public-site content inline. */
export async function canInlineEditAction(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return isAdminUser(user);
  } catch {
    return false;
  }
}
