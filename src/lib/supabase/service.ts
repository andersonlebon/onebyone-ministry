import { createClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "./config";

export function isServiceRoleConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only Supabase client with admin privileges (Auth admin API, etc.). */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
