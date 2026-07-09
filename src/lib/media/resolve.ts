import "server-only";

import { isDatabaseConfigured } from "@/lib/db/config";
import { listMediaAssets } from "@/lib/db/media";
import { getSiteContentValue } from "@/lib/db/site-content";
import { PLACEHOLDER_MEDIA, buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import type { GalleryPhoto, SiteMediaBundle } from "@/lib/media/types";

export const SITE_MEDIA_CONTENT_KEY = "media";

export async function getPublicMediaBundle(): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) {
    return PLACEHOLDER_MEDIA;
  }

  try {
    const stored = await getSiteContentValue<SiteMediaBundle>(SITE_MEDIA_CONTENT_KEY);
    const base = stored ?? buildPlaceholderMediaBundle();

    const photoAssets = await listMediaAssets("photos");
    if (photoAssets.length > 0) {
      return {
        ...base,
        galleryPhotos: photoAssets.map((asset, index) => ({
          id: index + 1,
          src: asset.publicUrl,
          alt: asset.alt ?? "",
          category: (asset.category ?? "Community") as GalleryPhoto["category"],
          h: 300,
        })),
      };
    }

    return base;
  } catch (error) {
    console.error("[media] Failed to load site media:", error);
  }

  return PLACEHOLDER_MEDIA;
}

export function getPlaceholderMediaBundle(): SiteMediaBundle {
  return buildPlaceholderMediaBundle();
}
