import { asc, eq, sql } from "drizzle-orm";

import { getDb } from "./index";
import { mediaAssets, photoAlbums, type NewPhotoAlbum, type PhotoAlbum } from "./schema";
import { SUGGESTED_ALBUM_NAMES, slugifyAlbumName } from "@/lib/photo-albums/defaults";

export async function listPhotoAlbums(): Promise<PhotoAlbum[]> {
  const db = getDb();
  return db.select().from(photoAlbums).orderBy(asc(photoAlbums.sortOrder), asc(photoAlbums.name));
}

export async function ensureSuggestedAlbums(): Promise<PhotoAlbum[]> {
  const existing = await listPhotoAlbums();
  if (existing.length > 0) return existing;

  const db = getDb();
  const rows: NewPhotoAlbum[] = SUGGESTED_ALBUM_NAMES.map((name, index) => ({
    name,
    slug: slugifyAlbumName(name),
    sortOrder: index,
  }));

  await db.insert(photoAlbums).values(rows).onConflictDoNothing();
  return listPhotoAlbums();
}

export async function createPhotoAlbum(name: string): Promise<PhotoAlbum> {
  const db = getDb();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Album name is required");

  const baseSlug = slugifyAlbumName(trimmed) || `album-${Date.now()}`;
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 20) {
    try {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(photoAlbums);

      const [row] = await db
        .insert(photoAlbums)
        .values({
          name: trimmed,
          slug,
          sortOrder: Number(count ?? 0),
        })
        .returning();

      if (!row) throw new Error("Failed to create album");
      return row;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("unique") && !message.includes("duplicate")) throw err;
      attempt += 1;
      slug = `${baseSlug}-${attempt + 1}`;
    }
  }

  throw new Error("Could not create a unique album slug");
}

export async function renamePhotoAlbum(id: string, name: string): Promise<PhotoAlbum> {
  const db = getDb();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Album name is required");

  const [row] = await db
    .update(photoAlbums)
    .set({ name: trimmed })
    .where(eq(photoAlbums.id, id))
    .returning();

  if (!row) throw new Error("Album not found");
  return row;
}

export async function deletePhotoAlbum(id: string): Promise<void> {
  const db = getDb();
  // album_id on photos becomes null via ON DELETE SET NULL
  await db.delete(photoAlbums).where(eq(photoAlbums.id, id));
}

export async function reorderPhotoAlbums(orderedIds: string[]): Promise<PhotoAlbum[]> {
  const db = getDb();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(photoAlbums).set({ sortOrder: index }).where(eq(photoAlbums.id, id))
    )
  );
  return listPhotoAlbums();
}

export async function countPhotosInAlbum(albumId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mediaAssets)
    .where(eq(mediaAssets.albumId, albumId));
  return Number(row?.count ?? 0);
}
