import "server-only";

import { isDatabaseConfigured } from "@/lib/db/config";
import { listMediaAssets } from "@/lib/db/media";
import { listPhotoAlbums } from "@/lib/db/photo-albums";
import { getSiteContentRow } from "@/lib/db/site-content";
import { PLACEHOLDER_MEDIA, buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import type { GalleryPhoto, SiteMediaBundle } from "@/lib/media/types";

export const SITE_MEDIA_CONTENT_KEY = "media";

export type PublicMediaPayload = {
  media: SiteMediaBundle;
  version: number | null;
  albums: Array<{ id: string; name: string; slug: string }>;
};

export async function getPublicMediaBundle(): Promise<PublicMediaPayload> {
  if (!isDatabaseConfigured()) {
    return { media: PLACEHOLDER_MEDIA, version: null, albums: [] };
  }

  try {
    const [row, albums] = await Promise.all([
      getSiteContentRow(SITE_MEDIA_CONTENT_KEY),
      listPhotoAlbums().catch(() => []),
    ]);
    const stored = (row?.value as SiteMediaBundle | undefined) ?? null;
    const version = row?.updatedAt ? row.updatedAt.getTime() : null;
    const base = stored ?? buildPlaceholderMediaBundle();
    const albumNameById = new Map(albums.map((a) => [a.id, a.name]));

    // Always derive the public gallery from Photo Library rows.
    // An empty library must stay empty (do not fall back to seeded galleryPhotos JSON).
    const photoAssets = await listMediaAssets("photos");
    const galleryPhotos: GalleryPhoto[] = photoAssets.map((asset, index) => ({
      id: index + 1,
      src: asset.publicUrl,
      alt: asset.alt ?? "",
      category: asset.category ?? "Community",
      albumId: asset.albumId ?? null,
      albumName: asset.albumId ? albumNameById.get(asset.albumId) ?? null : null,
      h: 300,
    }));

    return {
      version,
      albums: albums.map((a) => ({ id: a.id, name: a.name, slug: a.slug })),
      media: {
        ...base,
        galleryPhotos,
      },
    };
  } catch (error) {
    console.error("[media] Failed to load site media:", error);
  }

  return { media: PLACEHOLDER_MEDIA, version: null, albums: [] };
}

export function getPlaceholderMediaBundle(): SiteMediaBundle {
  return buildPlaceholderMediaBundle();
}
