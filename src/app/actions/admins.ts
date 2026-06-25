"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isServiceRoleConfigured } from "@/lib/supabase/service";
import type { AdminRole } from "@/lib/supabase/admin";
import { requireSuperAdminUser, requireStaffUser } from "@/lib/supabase/admin-server";
import { createServiceClient } from "@/lib/supabase/service";
import { getEmailProvider } from "@/services/email";
import { formatEmailSendError } from "@/services/email/errors";
import { adminInviteEmail } from "@/services/email/templates";

export type AdminListItem = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  lastSignIn?: string;
  status: "active" | "invited";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function getInviteRedirectUrl() {
  return `${getSiteUrl()}/auth/callback?next=/admin/accept-invite`;
}

async function sendAdminInvitation(input: {
  email: string;
  name: string;
  role: AdminRole;
}): Promise<InviteAdminResult> {
  const supabase = createServiceClient();
  const email = normalizeEmail(input.email);
  const redirectTo = getInviteRedirectUrl();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo,
      data: { name: input.name.trim() },
    },
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Could not create invitation link." };
  }

  const { error: roleError } = await supabase.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role: input.role },
    user_metadata: { name: input.name.trim() },
  });

  if (roleError) {
    return { ok: false, error: roleError.message };
  }

  const inviteUrl = data.properties?.action_link;
  if (!inviteUrl) {
    return { ok: false, error: "Invitation link was not generated." };
  }

  const template = adminInviteEmail({
    name: input.name.trim(),
    email,
    role: input.role,
    inviteUrl,
  });

  const provider = getEmailProvider();
  const result = await provider.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (!result.ok) {
    return {
      ok: false,
      error: formatEmailSendError(result.error),
    };
  }

  return {
    ok: true,
    message: `Invitation email sent to ${email}. They can set a password from the link.`,
  };
}

function mapAuthUser(user: {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  invited_at?: string;
  email_confirmed_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AdminListItem | null {
  const role = user.app_metadata?.role;
  if (role !== "super-admin" && role !== "admin" && role !== "viewer") {
    return null;
  }

  const name =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : user.email?.split("@")[0] ?? "Admin";

  const invited = Boolean(user.invited_at && !user.email_confirmed_at);

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role,
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at ?? undefined,
    status: invited ? "invited" : "active",
  };
}

export async function listAdminsAction(): Promise<AdminListItem[]> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return [];
  }

  await requireStaffUser();

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(error.message);
  }

  return data.users
    .map(mapAuthUser)
    .filter((row): row is AdminListItem => row !== null)
    .sort((a, b) => a.email.localeCompare(b.email));
}

export type InviteAdminResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function inviteAdminAction(input: {
  name: string;
  email: string;
  role: AdminRole;
}): Promise<InviteAdminResult> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return { ok: false, error: "Supabase is not configured for admin invitations." };
  }

  try {
    await requireSuperAdminUser();
  } catch {
    return { ok: false, error: "Only super-admins can invite new admins." };
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (!name) return { ok: false, error: "Name is required." };
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
  if (input.role === "super-admin") {
    return { ok: false, error: "Super-admin is created once during /setup only." };
  }

  const supabase = createServiceClient();
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const already = existingUsers?.users.find((u) => normalizeEmail(u.email ?? "") === email);

  if (already) {
    const existingRole = already.app_metadata?.role;
    if (existingRole === "super-admin" || existingRole === "admin" || existingRole === "viewer") {
      return { ok: false, error: "This email already has an admin account." };
    }
  }

  return sendAdminInvitation({ email, name, role: input.role });
}

export async function updateAdminRoleAction(input: {
  userId: string;
  role: AdminRole;
}): Promise<{ ok: boolean; error?: string }> {
  if (input.role === "super-admin") {
    return { ok: false, error: "Super-admin role is assigned only during /setup." };
  }

  try {
    await requireSuperAdminUser();
  } catch {
    return { ok: false, error: "Only super-admins can change roles." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(input.userId, {
    app_metadata: { role: input.role },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeAdminAction(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { user } = await requireSuperAdminUser();
    if (user.id === userId) {
      return { ok: false, error: "You cannot remove your own account." };
    }
  } catch {
    return { ok: false, error: "Only super-admins can remove admins." };
  }

  const supabase = createServiceClient();
  const { data: target, error: getError } = await supabase.auth.admin.getUserById(userId);

  if (getError || !target.user) {
    return { ok: false, error: getError?.message ?? "User not found." };
  }

  if (target.user.app_metadata?.role === "super-admin") {
    return { ok: false, error: "Super-admin accounts cannot be removed." };
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resendAdminInviteAction(email: string): Promise<InviteAdminResult> {
  try {
    await requireSuperAdminUser();
  } catch {
    return { ok: false, error: "Only super-admins can resend invitations." };
  }

  const supabase = createServiceClient();
  const normalized = normalizeEmail(email);
  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = users?.users.find((u) => normalizeEmail(u.email ?? "") === normalized);

  if (!target) {
    return { ok: false, error: "Admin account not found." };
  }

  const role = target.app_metadata?.role;
  if (role !== "admin" && role !== "viewer") {
    return { ok: false, error: "This account is not a pending staff invite." };
  }

  const name =
    typeof target.user_metadata?.name === "string" && target.user_metadata.name.trim()
      ? target.user_metadata.name.trim()
      : normalized.split("@")[0];

  const result = await sendAdminInvitation({
    email: normalized,
    name,
    role,
  });

  if (!result.ok) return result;
  return { ok: true, message: `Invitation resent to ${normalized}.` };
}
