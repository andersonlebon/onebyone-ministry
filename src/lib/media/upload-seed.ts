import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { MediaFolder } from "@/lib/db/schema";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function walkFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function inferFolder(relativePath: string): MediaFolder {
  const top = relativePath.split(/[/\\]/)[0]?.toLowerCase() ?? "";

  if (top === "photos" || top.startsWith("distribution")) return "photos";
  if (top === "video-thumbs") return "videos";
  if (top === "brand" || top === "brand-transparent" || top === "website-use") return "brand";
  return "general";
}

export type UploadedAssetRecord = {
  localPath: string;
  storagePath: string;
  publicUrl: string;
  alt: string;
  category: string;
  folder: MediaFolder;
};

/** Upload every file under public/assets to Supabase Storage during /setup. */
export async function uploadAllPublicAssets(
  supabase: SupabaseClient
): Promise<{ urlMap: Record<string, string>; records: UploadedAssetRecord[] }> {
  const assetsRoot = join(process.cwd(), "public", "assets");

  if (!statSync(assetsRoot).isDirectory()) {
    throw new Error("public/assets folder not found.");
  }

  const files = walkFiles(assetsRoot);
  const urlMap: Record<string, string> = {};
  const records: UploadedAssetRecord[] = [];

  for (const absolutePath of files) {
    const relativePath = relative(assetsRoot, absolutePath).replace(/\\/g, "/");
    const localPath = `/assets/${relativePath}`;
    const storagePath = `seed/${relativePath}`;
    const ext = absolutePath.slice(absolutePath.lastIndexOf(".")).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const body = readFileSync(absolutePath);

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, body, {
      upsert: true,
      contentType,
      cacheControl: "31536000",
    });

    if (error) {
      throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
    }

    const publicUrl = getStoragePublicUrl(supabase, storagePath);
    urlMap[localPath] = publicUrl;

    const folder = inferFolder(relativePath);
    const fileName = relativePath.split("/").pop() ?? relativePath;

    records.push({
      localPath,
      storagePath,
      publicUrl,
      alt: fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      category: folder === "photos" ? "Community" : "General",
      folder,
    });
  }

  return { urlMap, records };
}
