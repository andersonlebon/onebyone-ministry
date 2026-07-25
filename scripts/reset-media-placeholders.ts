/**
 * Reset content image slots in site_content.media to empty placeholders.
 * Keeps logos. Optionally deletes old seeded banner objects from storage.
 *
 * Usage: npx tsx scripts/reset-media-placeholders.ts [--dry-run] [--purge-storage]
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

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env"));
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const purgeStorage = process.argv.includes("--purge-storage");
  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    const empty = buildPlaceholderMediaBundle();
    const mediaRow = await sql<{ value: Record<string, unknown> }[]>`
      SELECT value FROM site_content WHERE key = 'media' LIMIT 1
    `;
    const existing = mediaRow[0]?.value as Record<string, unknown> | undefined;

    const next = {
      ...empty,
      brandAssets: (existing?.brandAssets as object) ?? empty.brandAssets,
      // Force content slots empty — do not keep old banner URLs
      websiteUseImages: empty.websiteUseImages,
      localImages: empty.localImages,
      homePillars: empty.homePillars,
      aboutStoryImages: empty.aboutStoryImages,
      founderTimelineImages: empty.founderTimelineImages,
      galleryPhotos: [],
      ministryVideos: [],
      featuredVideo: empty.featuredVideo,
      homeProjects: [],
      homeStories: [],
      projectImages: [],
      storyImages: [],
    };

    console.log(dryRun ? "DRY RUN" : "Resetting media content slots to placeholders…");
    console.log("Logos kept from existing brandAssets (if present).");

    if (!dryRun) {
      await sql`
        INSERT INTO site_content (key, value, updated_at)
        VALUES ('media', ${sql.json(next as never)}, now())
        ON CONFLICT (key) DO UPDATE SET value = ${sql.json(next as never)}, updated_at = now()
      `;
    }

    if (purgeStorage) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        console.warn("Skipping storage purge: missing Supabase URL or service role key.");
      } else {
        const rows = await sql<{ path: string }[]>`
          SELECT path FROM media_assets
          WHERE folder IN ('photos', 'projects', 'videos', 'general', 'posts')
             OR path LIKE 'seed/brand/%'
             OR path LIKE 'seed/website-use/%'
             OR path LIKE 'seed/photos/%'
             OR path LIKE 'seed/distribution-%'
             OR path LIKE 'seed/video-thumbs/%'
        `;
        console.log(`Storage objects to remove: ${rows.length}`);
        if (!dryRun && rows.length > 0) {
          const supabase = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          for (let i = 0; i < rows.length; i += 100) {
            const batch = rows.slice(i, i + 100).map((r) => r.path);
            const { error } = await supabase.storage.from("media").remove(batch);
            if (error) throw new Error(error.message);
          }
          await sql`
            DELETE FROM media_assets
            WHERE folder IN ('photos', 'projects', 'videos', 'general', 'posts')
               OR path LIKE 'seed/brand/%'
               OR path LIKE 'seed/website-use/%'
               OR path LIKE 'seed/photos/%'
               OR path LIKE 'seed/distribution-%'
               OR path LIKE 'seed/video-thumbs/%'
          `;
        }
      }
    }

    console.log("Done. Content images are empty placeholders; logos preserved.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
