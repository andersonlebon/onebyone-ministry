import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Client-safe check: Supabase Auth + Storage env vars are set.
 * DATABASE_URL (Drizzle) must also be set on the server for media DB operations.
 */
export function isSupabaseBackendConfigured() {
  return isSupabaseConfigured();
}
