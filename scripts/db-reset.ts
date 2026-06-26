import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

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

  const withAuth = process.argv.includes("--auth");

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    await sql`DELETE FROM contact_thread_messages`;
    await sql`DELETE FROM contact_threads`;
    await sql`DELETE FROM contact_messages`;
    await sql`DELETE FROM donations`;
    await sql`DELETE FROM media_assets`;
    await sql`DELETE FROM site_content`;
    await sql`DELETE FROM project_setup`;
    console.log(
      "Cleared tables: contact_thread_messages, contact_threads, contact_messages, donations, media_assets, site_content, project_setup"
    );
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
