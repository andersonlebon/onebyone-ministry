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
import { MEDIA_BUCKET } from "@/lib/supabase/config";

import { getDb } from "./index";
import { mediaAssets, projectSetup, siteContent } from "./schema";

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

export async function seedDefaultSiteData(uploadedBy?: string) {
  const db = getDb();

  const contentRows = [
    { key: "settings", value: defaultSiteSettings },
    { key: "posts", value: defaultPosts },
    { key: "projects", value: defaultProjects },
    { key: "videos", value: defaultVideos },
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

  const mediaSeed = [...defaultGallerySeed, ...defaultProjectMediaSeed, ...defaultVideoThumbSeed];

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
