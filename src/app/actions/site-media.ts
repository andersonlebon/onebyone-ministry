"use server";

import { upsertSiteContentValue, getSiteContentValue } from "@/lib/db/site-content";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPublicMediaBundle, SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
import { buildPlaceholderMediaBundle } from "@/lib/media/placeholders";
import { revalidatePublicSite } from "@/lib/site-content/revalidate";
import type { SiteMediaBundle } from "@/lib/media/types";
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

export type SiteMediaSlotPath =
  | ["websiteUseImages", "hero"]
  | ["websiteUseImages", "about"]
  | ["websiteUseImages", "projects"]
  | ["websiteUseImages", "community"]
  | ["websiteUseImages", "outreach"]
  | ["localImages", "contactHero"]
  | ["localImages", "donateHero"]
  | ["localImages", "storyHero"];

export async function getPublicMediaAction(): Promise<SiteMediaBundle> {
  const { media } = await getPublicMediaBundle();
  return media;
}

export async function updateSiteMediaAction(media: SiteMediaBundle): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  await requireAdminUser();
  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, media);
  revalidatePublicSite();

  return media;
}

/** Patch a single banner slot from the latest DB bundle (avoids clobbering other images). */
export async function updateSiteMediaSlotAction(
  path: SiteMediaSlotPath,
  url: string
): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  await requireAdminUser();

  const stored = await getSiteContentValue<SiteMediaBundle>(SITE_MEDIA_CONTENT_KEY);
  const base = stored ?? buildPlaceholderMediaBundle();

  const next: SiteMediaBundle = {
    ...base,
    websiteUseImages: { ...base.websiteUseImages },
    localImages: { ...base.localImages },
  };

  const [group, key] = path;
  if (group === "websiteUseImages") {
    next.websiteUseImages = { ...next.websiteUseImages, [key]: url };
  } else {
    next.localImages = { ...next.localImages, [key]: url };
  }

  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, next);
  revalidatePublicSite();

  return next;
}
