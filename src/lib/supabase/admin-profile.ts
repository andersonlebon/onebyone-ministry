import type { User } from "@supabase/supabase-js";

import { getAdminRole, type AdminRole } from "./admin";

export type AdminUserProfile = {
  name: string;
  email: string;
  role: AdminRole;
  initials: string;
};

const ROLE_LABELS: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
};

export function getAdminRoleLabel(role: AdminRole) {
  return ROLE_LABELS[role];
}

export function buildAdminProfile(user: User): AdminUserProfile {
  const name =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : (user.email?.split("@")[0] ?? "Admin");

  const role = getAdminRole(user) ?? "viewer";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    name,
    email: user.email ?? "",
    role,
    initials: initials || "A",
  };
}
