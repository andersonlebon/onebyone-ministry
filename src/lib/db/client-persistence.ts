import { isSupabaseBackendConfigured } from "@/lib/supabase/backend";

/** Client-safe check for whether admin edits should use server actions + Postgres. */
export function useServerActionsForContent() {
  return isSupabaseBackendConfigured();
}
