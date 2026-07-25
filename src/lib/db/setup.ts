import type { SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { defaultSiteSettings } from "@/content/site-defaults";
import { SETUP_ROW_ID } from "@/lib/setup/constants";
import { applyUrlMapToMediaBundle } from "@/lib/media/resolve-urls";
import { buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import { uploadAllPublicAssets } from "@/lib/media/upload-seed";
import { SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import { EMPTY_FINANCE } from "@/lib/site-content/types";
import { MEDIA_BUCKET } from "@/lib/supabase/config";

import { getDb } from "./index";
import { mediaAssets, projectSetup, siteContent } from "./schema";
import { upsertSiteContentValue } from "./site-content";

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

/**
 * Seeds text settings + logos only.
 * All content image slots stay as empty placeholders until the client uploads.
 */
export async function seedDefaultSiteData(supabase: SupabaseClient, uploadedBy?: string) {
  const db = getDb();

  const { urlMap, records } = await uploadAllPublicAssets(supabase);
  // urlMap only remaps logo paths; banners/gallery stay EMPTY_IMAGE.
  const mediaBundle = applyUrlMapToMediaBundle(buildPlaceholderMediaBundle(), urlMap);
  mediaBundle.galleryPhotos = [];
  mediaBundle.ministryVideos = [];
  mediaBundle.featuredVideo = {
    id: "",
    title: "",
    desc: "",
    duration: "",
    category: "",
    thumb: "",
  };

  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, mediaBundle);

  const contentRows = [
    { key: SITE_CONTENT_KEYS.settings, value: defaultSiteSettings },
    { key: SITE_CONTENT_KEYS.posts, value: [] },
    { key: SITE_CONTENT_KEYS.projects, value: [] },
    { key: SITE_CONTENT_KEYS.videos, value: [] },
    { key: SITE_CONTENT_KEYS.finance, value: { ...EMPTY_FINANCE } },
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
