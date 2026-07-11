import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

const DELETED_TABLES = [
  "contact_thread_messages",
  "contact_threads",
  "contact_messages",
  "donations",
  "media_assets",
  "site_content",
  "project_setup",
] as const;

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function supabaseProjectRef(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const match = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function isProductionDatabaseTarget(databaseUrl: string): boolean {
  if (process.env.NODE_ENV === "production") return true;

  const productionDatabaseUrl = process.env.PRODUCTION_DATABASE_URL?.trim();
  if (productionDatabaseUrl && databaseUrl === productionDatabaseUrl) return true;

  const dbRef = supabaseProjectRef(databaseUrl);
  const supabaseRef = supabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (dbRef && supabaseRef && dbRef === supabaseRef) return true;

  return false;
}

function hasProductionResetOverride(argv: string[]): boolean {
  return (
    process.env.ALLOW_PRODUCTION_DB_RESET === "1" ||
    argv.includes("--force-production")
  );
}

function printProductionResetWarning(databaseUrl: string, withAuth: boolean) {
  const red = "\x1b[31m";
  const bold = "\x1b[1m";
  const reset = "\x1b[0m";

  console.error(
    `${red}${bold}
╔══════════════════════════════════════════════════════════════════╗
║  DANGER: PRODUCTION DATABASE RESET BLOCKED                       ║
╚══════════════════════════════════════════════════════════════════╝${reset}`
  );
  console.error("");
  console.error("This command would permanently delete production data:");
  for (const table of DELETED_TABLES) {
    console.error(`  - ${table}`);
  }
  console.error("  - All files in Supabase storage bucket: media");
  if (withAuth) {
    console.error("  - All Supabase auth users (admin accounts)");
  }
  console.error("");
  console.error(`Target database: ${normalizeDatabaseUrl(databaseUrl)}`);
  console.error("");
  console.error("Take a Supabase backup before any production reset.");
  console.error("See scripts/PRODUCTION.md for the safe workflow.");
  console.error("");
  console.error("To override (emergency only):");
  console.error("  ALLOW_PRODUCTION_DB_RESET=1 npm run db:reset");
  console.error("  npm run db:reset -- --force-production");
}

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

type StorageAdminClient = Pick<SupabaseClient, "storage">;

async function listAllStoragePaths(
  supabase: StorageAdminClient,
  bucket: string,
  prefix = ""
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit, offset });
    if (error) {
      throw new Error(`Storage list failed at "${prefix || "/"}": ${error.message}`);
    }
    if (!data?.length) break;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      // Supabase folder entries have no object id.
      if (item.id === null) {
        const nested = await listAllStoragePaths(supabase, bucket, itemPath);
        paths.push(...nested);
      } else {
        paths.push(itemPath);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function resetStorageBucket() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skipping storage reset: missing Supabase env vars");
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const bucket = "media";
  const paths = await listAllStoragePaths(supabase, bucket);

  if (paths.length === 0) {
    console.log(`Storage bucket "${bucket}" is already empty.`);
    return;
  }

  let removed = 0;
  const batchSize = 100;

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error: removeError } = await supabase.storage.from(bucket).remove(batch);
    if (removeError) {
      throw new Error(`Storage delete failed: ${removeError.message}`);
    }
    removed += batch.length;
  }

  console.log(`Removed ${removed} file(s) from storage bucket "${bucket}".`);
}

async function resetAllAuthUsers() {
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

  let deleted = 0;
  for (const user of data.users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      throw new Error(`Auth delete failed for ${user.email ?? user.id}: ${deleteError.message}`);
    }
    deleted += 1;
  }

  console.log(`Deleted ${deleted} auth user(s).`);
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL. Set it in .env.local first.");
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const withAuth = argv.includes("--auth");

  if (isProductionDatabaseTarget(databaseUrl) && !hasProductionResetOverride(argv)) {
    printProductionResetWarning(databaseUrl, withAuth);
    process.exit(1);
  }

  if (isProductionDatabaseTarget(databaseUrl) && hasProductionResetOverride(argv)) {
    const red = "\x1b[31m";
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";
    console.warn(
      `${red}${bold}WARNING: Production reset override enabled. Data will be deleted.${reset}`
    );
    for (const table of DELETED_TABLES) {
      console.warn(`  - ${table}`);
    }
    console.warn("  - Supabase storage bucket: media");
    if (withAuth) console.warn("  - All Supabase auth users");
    console.warn(`Target: ${normalizeDatabaseUrl(databaseUrl)}`);
    console.warn("Continuing in 5 seconds. Press Ctrl+C to abort.");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    await sql`DELETE FROM contact_thread_messages`;
    await sql`DELETE FROM contact_threads`;
    await sql`DELETE FROM contact_messages`;
    await sql`DELETE FROM donations`;
    await sql`DELETE FROM media_assets`;
    await sql`DELETE FROM site_content`;
    await sql`DELETE FROM project_setup`;
    console.log(`Cleared tables: ${DELETED_TABLES.join(", ")}`);
  } finally {
    await sql.end();
  }

  await resetStorageBucket();

  if (withAuth) {
    await resetAllAuthUsers();
  } else {
    console.log("Auth users kept. Re-run with --auth to delete all Supabase auth users.");
  }

  console.log("Done. Visit /setup to launch the project again.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
