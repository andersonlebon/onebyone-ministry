"use server";

import { isDatabaseConfigured } from "@/lib/db/config";
import {
  createPhotoAlbum,
  deletePhotoAlbum,
  ensureSuggestedAlbums,
  listPhotoAlbums,
  renamePhotoAlbum,
  reorderPhotoAlbums,
} from "@/lib/db/photo-albums";
import type { PhotoAlbum } from "@/lib/db/schema";
import { revalidatePhotoGallery } from "@/lib/site-content/revalidate";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user) || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function assertDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }
}

export async function listPhotoAlbumsAction(): Promise<PhotoAlbum[]> {
  assertDatabase();
  return listPhotoAlbums();
}

/** Lists albums; seeds suggested names once when the table is empty. */
export async function listOrSeedPhotoAlbumsAction(): Promise<PhotoAlbum[]> {
  assertDatabase();
  await requireAdminUser();
  return ensureSuggestedAlbums();
}

export async function createPhotoAlbumAction(name: string): Promise<PhotoAlbum> {
  assertDatabase();
  await requireAdminUser();
  const album = await createPhotoAlbum(name);
  revalidatePhotoGallery();
  return album;
}

export async function renamePhotoAlbumAction(id: string, name: string): Promise<PhotoAlbum> {
  assertDatabase();
  await requireAdminUser();
  const album = await renamePhotoAlbum(id, name);
  revalidatePhotoGallery();
  return album;
}

/** Deletes the album and returns the remaining album list (photos become Unassigned). */
export async function deletePhotoAlbumAction(id: string): Promise<PhotoAlbum[]> {
  assertDatabase();
  await requireAdminUser();
  await deletePhotoAlbum(id);
  const remaining = await listPhotoAlbums();
  revalidatePhotoGallery();
  return remaining;
}

export async function reorderPhotoAlbumsAction(orderedIds: string[]): Promise<PhotoAlbum[]> {
  assertDatabase();
  await requireAdminUser();
  const albums = await reorderPhotoAlbums(orderedIds);
  revalidatePhotoGallery();
  return albums;
}
