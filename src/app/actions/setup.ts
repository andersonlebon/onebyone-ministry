"use server";

import { isDatabaseConfigured } from "@/lib/db/config";
import { isSetupComplete, markSetupComplete, seedDefaultSiteData } from "@/lib/db/setup";
import { SETUP_SUPER_ADMIN_EMAIL } from "@/lib/setup/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export type SetupStatus = {
  complete: boolean;
  configured: {
    supabase: boolean;
    database: boolean;
    serviceRole: boolean;
  };
  completedAt?: string;
  superAdminEmail?: string;
  canRun: boolean;
  databaseError?: string;
};

export type RunSetupResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getSetupStatusAction(): Promise<SetupStatus> {
  const configured = {
    supabase: isSupabaseConfigured(),
    database: isDatabaseConfigured(),
    serviceRole: isServiceRoleConfigured(),
  };

  const envReady = configured.supabase && configured.database && configured.serviceRole;

  if (!envReady) {
    return {
      complete: false,
      configured,
      canRun: false,
    };
  }

  try {
    const complete = await isSetupComplete();
    if (!complete) {
      return {
        complete: false,
        configured,
        canRun: true,
      };
    }

    const { getSetupRecord } = await import("@/lib/db/setup");
    const row = await getSetupRecord();

    return {
      complete: true,
      configured,
      canRun: false,
      completedAt: row?.completedAt?.toISOString(),
      superAdminEmail: row?.superAdminEmail,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not connect to the database.";
    return {
      complete: false,
      configured,
      canRun: true,
      databaseError: message,
    };
  }
}

export async function runProjectSetupAction(input: {
  email: string;
  password: string;
  name: string;
}): Promise<RunSetupResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY." };
  }

  if (!isDatabaseConfigured()) {
    return { ok: false, error: "DATABASE_URL is not configured." };
  }

  if (!isServiceRoleConfigured()) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured. Copy it from Supabase → Project Settings → API." };
  }

  const email = normalizeEmail(input.email);
  if (email !== SETUP_SUPER_ADMIN_EMAIL) {
    return {
      ok: false,
      error: `Setup is restricted to ${SETUP_SUPER_ADMIN_EMAIL}.`,
    };
  }

  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  try {
    if (await isSetupComplete()) {
      return { ok: false, error: "Project setup has already been completed. This page can only be used once." };
    }

    const supabase = createServiceClient();
    let userId: string;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name, password_set: true },
      app_metadata: { role: "super-admin" },
    });

    if (createError) {
      const alreadyExists =
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("registered");

      if (!alreadyExists) {
        return { ok: false, error: createError.message };
      }

      const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listError) {
        return { ok: false, error: listError.message };
      }

      const existing = listData.users.find((u) => normalizeEmail(u.email ?? "") === email);
      if (!existing) {
        return { ok: false, error: "Could not create or find the super-admin account." };
      }

      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: input.password,
        email_confirm: true,
        user_metadata: { name, password_set: true },
        app_metadata: { role: "super-admin" },
      });

      if (updateError) {
        return { ok: false, error: updateError.message };
      }

      userId = updated.user.id;
    } else {
      userId = created.user.id;
    }

    await seedDefaultSiteData(supabase, userId);
    await markSetupComplete(email, userId);

    return {
      ok: true,
      message: "Project launched. Sign in at /admin/login with your new super-admin account.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed.";
    return { ok: false, error: message };
  }
}
