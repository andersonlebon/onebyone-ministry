import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAdminRole, isStaffUser, isSuperAdmin, type AdminRole } from "@/lib/supabase/admin";

export async function requireStaffUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isStaffUser(user) || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user, role: getAdminRole(user)! };
}

export async function requireSuperAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user) || !user) {
    throw new Error("Only super-admins can manage admin accounts.");
  }

  return { supabase, user, role: "super-admin" as AdminRole };
}
