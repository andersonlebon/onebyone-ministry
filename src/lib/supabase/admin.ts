import type { User } from "@supabase/supabase-js";

export type AdminRole = "super-admin" | "admin" | "viewer";

export function getAdminRole(user: User | null | undefined): AdminRole | null {
  const role = user?.app_metadata?.role;
  if (role === "super-admin" || role === "admin" || role === "viewer") {
    return role;
  }
  return null;
}

export function isAdminUser(user: User | null | undefined) {
  const role = getAdminRole(user);
  return role === "super-admin" || role === "admin";
}
