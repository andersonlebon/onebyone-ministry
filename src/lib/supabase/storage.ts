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
