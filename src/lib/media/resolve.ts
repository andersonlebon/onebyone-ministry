import "server-only";

import { isDatabaseConfigured } from "@/lib/db/config";
import { getSiteContentValue } from "@/lib/db/site-content";
import { isSetupComplete } from "@/lib/db/setup";
import { PLACEHOLDER_MEDIA, buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import type { SiteMediaBundle } from "@/lib/media/types";

export const SITE_MEDIA_CONTENT_KEY = "media";

export async function getPublicMediaBundle(): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) {
    return PLACEHOLDER_MEDIA;
  }

  try {
    const setupDone = await isSetupComplete();
    if (!setupDone) {
      return PLACEHOLDER_MEDIA;
    }

    const stored = await getSiteContentValue<SiteMediaBundle>(SITE_MEDIA_CONTENT_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.error("[media] Failed to load site media:", error);
  }

  return PLACEHOLDER_MEDIA;
}

export function getPlaceholderMediaBundle(): SiteMediaBundle {
  return buildPlaceholderMediaBundle();
}
