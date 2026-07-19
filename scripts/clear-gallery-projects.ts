/**
 * Soft wipe of demo gallery photos + projects so the client can add their own.
 * Keeps: admin auth, site settings, banners/logos, stories, videos, finance, setup flag.
 *
 * Usage:
 *   npx tsx scripts/clear-gallery-projects.ts
 *   npx tsx scripts/clear-gallery-projects.ts --dry-run
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
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
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

async function removeStoragePaths(paths: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skipping storage cleanup: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return 0;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let removed = 0;
  const batchSize = 100;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from("media").remove(batch);
    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
    removed += batch.length;
  }
  return removed;
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env"));
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "DRY RUN (no changes)" : "Clearing gallery photos + projects…");
  console.log(`Target: ${normalizeDatabaseUrl(databaseUrl)}`);

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    const photoRows = await sql<{ id: string; path: string }[]>`
      SELECT id, path FROM media_assets WHERE folder = 'photos'
    `;
    const projectAssetRows = await sql<{ id: string; path: string }[]>`
      SELECT id, path FROM media_assets WHERE folder = 'projects'
    `;
    const projectContent = await sql<{ value: unknown }[]>`
      SELECT value FROM site_content WHERE key = 'projects' LIMIT 1
    `;
    const mediaContent = await sql<{ value: unknown }[]>`
      SELECT value FROM site_content WHERE key = 'media' LIMIT 1
    `;

    const projectCount = Array.isArray(projectContent[0]?.value)
      ? (projectContent[0].value as unknown[]).length
      : 0;
    const galleryInJson = Array.isArray(
      (mediaContent[0]?.value as { galleryPhotos?: unknown[] } | undefined)?.galleryPhotos
    )
      ? ((mediaContent[0].value as { galleryPhotos: unknown[] }).galleryPhotos.length)
      : 0;

    console.log(`Photo Library rows: ${photoRows.length}`);
    console.log(`Project media_assets rows: ${projectAssetRows.length}`);
    console.log(`Projects in site_content: ${projectCount}`);
    console.log(`galleryPhotos embedded in media JSON: ${galleryInJson}`);

    if (dryRun) {
      console.log("Dry run complete. Re-run without --dry-run to apply.");
      return;
    }

    const storagePaths = [...photoRows, ...projectAssetRows].map((r) => r.path);

    if (photoRows.length > 0) {
      await sql`DELETE FROM media_assets WHERE folder = 'photos'`;
      console.log(`Deleted ${photoRows.length} photo asset row(s).`);
    }
    if (projectAssetRows.length > 0) {
      await sql`DELETE FROM media_assets WHERE folder = 'projects'`;
      console.log(`Deleted ${projectAssetRows.length} project asset row(s).`);
    }

    await sql`
      INSERT INTO site_content (key, value, updated_at)
      VALUES ('projects', '[]'::jsonb, now())
      ON CONFLICT (key) DO UPDATE
      SET value = '[]'::jsonb, updated_at = now()
    `;
    console.log("Cleared site_content.projects to [].");

    if (mediaContent[0]?.value && typeof mediaContent[0].value === "object") {
      const media = { ...(mediaContent[0].value as Record<string, unknown>), galleryPhotos: [] };
      await sql`
        UPDATE site_content
        SET value = ${sql.json(media as never)}, updated_at = now()
        WHERE key = 'media'
      `;
      console.log("Cleared media.galleryPhotos fallback to [].");
    }

    if (storagePaths.length > 0) {
      const removed = await removeStoragePaths(storagePaths);
      console.log(`Removed ${removed} file(s) from storage.`);
    } else {
      console.log("No storage files to remove for photos/projects folders.");
    }

    console.log("Done. Gallery and projects are empty. Client can upload/add from admin.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
