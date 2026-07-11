import "server-only";

import { isDatabaseConfigured } from "@/lib/db/config";
import { listMediaAssets } from "@/lib/db/media";
import { getSiteContentRow } from "@/lib/db/site-content";
import { PLACEHOLDER_MEDIA, buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import type { GalleryPhoto, SiteMediaBundle } from "@/lib/media/types";

export const SITE_MEDIA_CONTENT_KEY = "media";

export type PublicMediaPayload = {
  media: SiteMediaBundle;
  version: number | null;
};

export async function getPublicMediaBundle(): Promise<PublicMediaPayload> {
  if (!isDatabaseConfigured()) {
    return { media: PLACEHOLDER_MEDIA, version: null };
  }

  try {
    const row = await getSiteContentRow(SITE_MEDIA_CONTENT_KEY);
    const stored = (row?.value as SiteMediaBundle | undefined) ?? null;
    const version = row?.updatedAt ? row.updatedAt.getTime() : null;
    const base = stored ?? buildPlaceholderMediaBundle();

    const photoAssets = await listMediaAssets("photos");
    if (photoAssets.length > 0) {
      return {
        version,
        media: {
          ...base,
          galleryPhotos: photoAssets.map((asset, index) => ({
            id: index + 1,
            src: asset.publicUrl,
            alt: asset.alt ?? "",
            category: (asset.category ?? "Community") as GalleryPhoto["category"],
            h: 300,
          })),
        },
      };
    }

    return { media: base, version };
  } catch (error) {
    console.error("[media] Failed to load site media:", error);
  }

  return { media: PLACEHOLDER_MEDIA, version: null };
}

export function getPlaceholderMediaBundle(): SiteMediaBundle {
  return buildPlaceholderMediaBundle();
}
