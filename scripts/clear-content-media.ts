/**
 * Remove client-content media so the ministry can upload their own.
 * Keeps design assets (brand / website-use) and non-media site settings.
 *
 * Clears: photos, projects, videos assets + projects/videos/posts content + gallery JSON.
 * Usage: npx tsx scripts/clear-content-media.ts [--dry-run]
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

import { buildPlaceholderMediaBundle } from "../src/lib/media/placeholders";

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

async function removeStoragePaths(paths: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || paths.length === 0) return 0;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let removed = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await supabase.storage.from("media").remove(batch);
    if (error) throw new Error(error.message);
    removed += batch.length;
  }
  return removed;
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env"));
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    const rows = await sql<{ id: string; path: string; folder: string }[]>`
      SELECT id, path, folder FROM media_assets
      WHERE folder IN ('photos', 'projects', 'videos', 'general', 'posts')
         OR path LIKE 'seed/photos/%'
         OR path LIKE 'seed/distribution-%'
         OR path LIKE 'seed/video-thumbs/%'
    `;

    console.log(dryRun ? "DRY RUN" : "Clearing content media…");
    console.log(`Content media_assets to remove: ${rows.length}`);

    if (dryRun) return;

    if (rows.length > 0) {
      await sql`
        DELETE FROM media_assets
        WHERE folder IN ('photos', 'projects', 'videos', 'general', 'posts')
           OR path LIKE 'seed/photos/%'
           OR path LIKE 'seed/distribution-%'
           OR path LIKE 'seed/video-thumbs/%'
      `;
    }

    await sql`
      INSERT INTO site_content (key, value, updated_at) VALUES
        ('projects', '[]'::jsonb, now()),
        ('videos', '[]'::jsonb, now()),
        ('posts', '[]'::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;

    const designBundle = buildPlaceholderMediaBundle();
    // Keep any existing brand URLs if media row exists; otherwise write design bundle.
    const mediaRow = await sql<{ value: Record<string, unknown> }[]>`
      SELECT value FROM site_content WHERE key = 'media' LIMIT 1
    `;
    const existing = mediaRow[0]?.value as Record<string, unknown> | undefined;
    const next = {
      ...designBundle,
      brandAssets: (existing?.brandAssets as object) ?? designBundle.brandAssets,
      websiteUseImages: {
        ...designBundle.websiteUseImages,
        ...((existing?.websiteUseImages as object) ?? {}),
      },
      localImages: {
        ...designBundle.localImages,
        ...((existing?.localImages as object) ?? {}),
      },
      galleryPhotos: [],
      ministryVideos: [],
      featuredVideo: designBundle.featuredVideo,
      homeProjects: [],
      homeStories: [],
      projectImages: [],
      storyImages: [],
    };

    await sql`
      INSERT INTO site_content (key, value, updated_at)
      VALUES ('media', ${sql.json(next as never)}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${sql.json(next as never)}, updated_at = now()
    `;

    const removed = await removeStoragePaths(rows.map((r) => r.path));
    console.log(`Removed ${removed} storage file(s).`);
    console.log("Done. Design banners/logos kept; content media cleared.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
