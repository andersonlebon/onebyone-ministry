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

export function needsInvitePasswordSetup(user: User | null | undefined) {
  const role = getAdminRole(user);
  if (role !== "admin" && role !== "viewer") return false;
  return user?.user_metadata?.password_set !== true;
}

export function getAdminDisplayName(user: User | null | undefined) {
  const name = user?.user_metadata?.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return user?.email?.split("@")[0] ?? "Admin";
}

export function getAdminInitials(user: User | null | undefined) {
  return getAdminDisplayName(user)
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
};
