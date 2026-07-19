import { desc, eq } from "drizzle-orm";

import { getDb } from "./index";
import { mediaAssets, type MediaAsset, type MediaFolder, type NewMediaAsset } from "./schema";

export async function listMediaAssets(folder?: MediaFolder): Promise<MediaAsset[]> {
  const db = getDb();

  if (folder) {
    return db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.folder, folder))
      .orderBy(desc(mediaAssets.createdAt));
  }

  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

export async function createMediaAsset(input: NewMediaAsset): Promise<MediaAsset> {
  const db = getDb();
  const [row] = await db.insert(mediaAssets).values(input).returning();
  if (!row) {
    throw new Error("Failed to create media asset");
  }
  return row;
}

export async function updateMediaAsset(
  id: string,
  input: Partial<Pick<MediaAsset, "alt" | "category" | "publicUrl" | "albumId">>
): Promise<MediaAsset> {
  const db = getDb();
  const [row] = await db
    .update(mediaAssets)
    .set(input)
    .where(eq(mediaAssets.id, id))
    .returning();

  if (!row) {
    throw new Error("Media asset not found");
  }

  return row;
}

export async function deleteMediaAssetById(id: string): Promise<MediaAsset> {
  const db = getDb();
  const [row] = await db.delete(mediaAssets).where(eq(mediaAssets.id, id)).returning();

  if (!row) {
    throw new Error("Media asset not found");
  }

  return row;
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | undefined> {
  const db = getDb();
  const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return row;
}
