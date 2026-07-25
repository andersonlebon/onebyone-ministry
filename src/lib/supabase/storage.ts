import type { SupabaseClient } from "@supabase/supabase-js";

import type { MediaFolder } from "@/lib/db/schema";
import { MEDIA_BUCKET } from "./config";

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getStoragePublicUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadToMediaBucket(
  supabase: SupabaseClient,
  file: File,
  folder: MediaFolder
) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const objectPath = `${folder}/${Date.now()}-${sanitizeFilename(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  return {
    path: objectPath,
    publicUrl: getStoragePublicUrl(supabase, objectPath),
  };
}

export async function deleteStorageObject(supabase: SupabaseClient, path: string) {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    throw error;
  }
}

/** Extract storage object path from a public media URL (strips ?v= cache-bust). */
export function extractMediaBucketPath(publicUrl: string): string | null {
  if (!publicUrl || publicUrl.startsWith("/") || publicUrl.startsWith("data:")) return null;

  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;

  const raw = publicUrl.slice(idx + marker.length).split("?")[0] ?? "";
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Logos are shared; never delete them when replacing a banner. */
export function shouldDeleteReplacedMediaPath(path: string): boolean {
  if (!path) return false;
  if (path.startsWith("seed/brand-transparent/")) return false;
  if (path.includes("/brand-transparent/")) return false;
  return true;
}

/** Best-effort delete of a previous banner/content object after a successful replace. */
export async function deletePreviousMediaUrl(
  supabase: SupabaseClient,
  previousUrl: string | undefined | null
) {
  if (!previousUrl) return;
  const path = extractMediaBucketPath(previousUrl);
  if (!path || !shouldDeleteReplacedMediaPath(path)) return;

  try {
    await deleteStorageObject(supabase, path);
  } catch (error) {
    console.warn("[storage] Could not delete previous media object:", path, error);
  }
}
