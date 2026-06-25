import type { User } from "@supabase/supabase-js";

export type AdminRole = "super-admin" | "admin" | "viewer";

export function getAdminRole(user: User | null | undefined): AdminRole | null {
  const role = user?.app_metadata?.role;
  if (role === "super-admin" || role === "admin" || role === "viewer") {
    return role;
  }
  return null;
}

/** Any staff account that may access the admin portal (includes read-only viewers). */
export function isStaffUser(user: User | null | undefined) {
  return getAdminRole(user) !== null;
}

/** Content/admin actions (excludes read-only viewers). */
export function isAdminUser(user: User | null | undefined) {
  const role = getAdminRole(user);
  return role === "super-admin" || role === "admin";
}

export function isSuperAdmin(user: User | null | undefined) {
  return getAdminRole(user) === "super-admin";
}
