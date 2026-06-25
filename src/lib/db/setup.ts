import type { SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import {
  defaultGallerySeed,
  defaultPosts,
  defaultProjectMediaSeed,
  defaultProjects,
  defaultSiteSettings,
  defaultVideoThumbSeed,
  defaultVideos,
} from "@/content/site-defaults";
import { SETUP_ROW_ID } from "@/lib/setup/constants";
import { applyUrlMapToMediaBundle } from "@/lib/media/resolve-urls";
import { buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import { uploadAllPublicAssets } from "@/lib/media/upload-seed";
import { SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
import { MEDIA_BUCKET } from "@/lib/supabase/config";

import { getDb } from "./index";
import { mediaAssets, projectSetup, siteContent } from "./schema";
import { upsertSiteContentValue } from "./site-content";

function resolveSeedRows<T extends { img?: string; thumb?: string; publicUrl?: string }>(
  rows: readonly T[],
  urlMap: Record<string, string>
): T[] {
  return rows.map((row) => {
    const next = { ...row } as T & { img?: string; thumb?: string; publicUrl?: string };
    if (next.img && urlMap[next.img]) next.img = urlMap[next.img];
    if (next.thumb && urlMap[next.thumb]) next.thumb = urlMap[next.thumb];
    if (next.publicUrl && urlMap[next.publicUrl]) next.publicUrl = urlMap[next.publicUrl];
    return next as T;
  });
}

export async function getSetupRecord() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectSetup)
    .where(eq(projectSetup.id, SETUP_ROW_ID))
    .limit(1);
  return row;
}

export async function isSetupComplete() {
  const row = await getSetupRecord();
  return Boolean(row);
}

export async function seedDefaultSiteData(supabase: SupabaseClient, uploadedBy?: string) {
  const db = getDb();

  const { urlMap, records } = await uploadAllPublicAssets(supabase);
  const mediaBundle = applyUrlMapToMediaBundle(buildPlaceholderMediaBundle(), urlMap);

  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, mediaBundle);

  const contentRows = [
    { key: "settings", value: defaultSiteSettings },
    {
      key: "posts",
      value: resolveSeedRows(defaultPosts, urlMap),
    },
    {
      key: "projects",
      value: resolveSeedRows(defaultProjects, urlMap),
    },
    {
      key: "videos",
      value: resolveSeedRows(defaultVideos, urlMap),
    },
  ] as const;

  for (const row of contentRows) {
    await db
      .insert(siteContent)
      .values({ key: row.key, value: row.value })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { value: row.value, updatedAt: new Date() },
      });
  }

  const mediaSeed = [
    ...defaultGallerySeed.map((item) => ({
      ...item,
      publicUrl: urlMap[item.publicUrl] ?? item.publicUrl,
      path: item.path,
    })),
    ...defaultProjectMediaSeed.map((item) => ({
      ...item,
      publicUrl: urlMap[item.publicUrl] ?? item.publicUrl,
    })),
    ...defaultVideoThumbSeed.map((item) => ({
      ...item,
      publicUrl: urlMap[item.publicUrl] ?? item.publicUrl,
    })),
  ];

  for (const item of records) {
    await db
      .insert(mediaAssets)
      .values({
        bucket: MEDIA_BUCKET,
        path: item.storagePath,
        publicUrl: item.publicUrl,
        alt: item.alt,
        category: item.category,
        folder: item.folder,
        uploadedBy: uploadedBy ?? null,
      })
      .onConflictDoUpdate({
        target: mediaAssets.path,
        set: {
          publicUrl: item.publicUrl,
          alt: item.alt,
          category: item.category,
          folder: item.folder,
        },
      });
  }

  for (const item of mediaSeed) {
    await db
      .insert(mediaAssets)
      .values({
        bucket: MEDIA_BUCKET,
        path: item.path,
        publicUrl: item.publicUrl,
        alt: item.alt,
        category: item.category,
        folder: item.folder,
        uploadedBy: uploadedBy ?? null,
      })
      .onConflictDoNothing({ target: mediaAssets.path });
  }
}

export async function markSetupComplete(superAdminEmail: string, superAdminUserId: string) {
  const db = getDb();

  await db.insert(projectSetup).values({
    id: SETUP_ROW_ID,
    completedAt: new Date(),
    superAdminEmail,
    superAdminUserId,
  });
}
