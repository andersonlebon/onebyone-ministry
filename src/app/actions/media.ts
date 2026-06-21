"use server";

import {
  createMediaAsset,
  deleteMediaAssetById,
  listMediaAssets,
  updateMediaAsset,
} from "@/lib/db/media";
import { isDatabaseConfigured } from "@/lib/db/config";
import type { MediaAsset, MediaFolder } from "@/lib/db/schema";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
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

export async function listMediaAssetsAction(folder?: MediaFolder): Promise<MediaAsset[]> {
  assertDatabase();
  return listMediaAssets(folder);
}

export async function createMediaAssetAction(input: {
  path: string;
  publicUrl: string;
  folder: MediaFolder;
  alt?: string;
  category?: string;
}): Promise<MediaAsset> {
  assertDatabase();
  const user = await requireAdminUser();

  return createMediaAsset({
    bucket: MEDIA_BUCKET,
    path: input.path,
    publicUrl: input.publicUrl,
    folder: input.folder,
    alt: input.alt ?? null,
    category: input.category ?? null,
    uploadedBy: user.id,
  });
}

export async function updateMediaAssetAction(
  id: string,
  input: { alt: string; category: string; publicUrl: string }
): Promise<MediaAsset> {
  assertDatabase();
  await requireAdminUser();
  return updateMediaAsset(id, input);
}

export async function deleteMediaAssetAction(id: string): Promise<MediaAsset> {
  assertDatabase();
  await requireAdminUser();
  return deleteMediaAssetById(id);
}
