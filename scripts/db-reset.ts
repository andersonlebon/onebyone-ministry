import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

import { SETUP_SUPER_ADMIN_EMAIL } from "../src/lib/setup/constants";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function resetAuthUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skipping auth reset: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    throw new Error(`Auth list failed: ${error.message}`);
  }

  const target = data.users.find(
    (user) => user.email?.trim().toLowerCase() === SETUP_SUPER_ADMIN_EMAIL
  );

  if (!target) {
    console.log(`No auth user found for ${SETUP_SUPER_ADMIN_EMAIL}`);
    return;
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(target.id);
  if (deleteError) {
    throw new Error(`Auth delete failed: ${deleteError.message}`);
  }

  console.log(`Deleted auth user: ${SETUP_SUPER_ADMIN_EMAIL}`);
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL. Set it in .env.local first.");
    process.exit(1);
  }

  const withAuth = process.argv.includes("--auth");

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    await sql`DELETE FROM contact_thread_messages`;
    await sql`DELETE FROM contact_threads`;
    await sql`DELETE FROM contact_messages`;
    await sql`DELETE FROM media_assets`;
    await sql`DELETE FROM site_content`;
    await sql`DELETE FROM project_setup`;
    console.log("Cleared tables: contact_thread_messages, contact_threads, contact_messages, media_assets, site_content, project_setup");
  } finally {
    await sql.end();
  }

  if (withAuth) {
    await resetAuthUser();
  } else {
    console.log("Auth users kept. Re-run with --auth to delete the setup super-admin.");
  }

  console.log("Done. Visit /setup to launch the project again.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
