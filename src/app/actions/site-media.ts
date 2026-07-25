"use server";

import { upsertSiteContentValue, getSiteContentValue } from "@/lib/db/site-content";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPublicMediaBundle, SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
import { EMPTY_IMAGE } from "@/lib/media/placeholders";
import { sanitizeMediaBundle } from "@/lib/media/sanitize-bundle";
import { revalidatePublicSite } from "@/lib/site-content/revalidate";
import type { SiteMediaBundle } from "@/lib/media/types";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { deletePreviousMediaUrl } from "@/lib/supabase/storage";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user) || !user) {
    throw new Error("Unauthorized");
  }

  return { user, supabase };
}

export type SiteMediaSlotPath =
  | ["websiteUseImages", "hero"]
  | ["websiteUseImages", "about"]
  | ["websiteUseImages", "projects"]
  | ["websiteUseImages", "community"]
  | ["websiteUseImages", "outreach"]
  | ["websiteUseImages", "mission"]
  | ["websiteUseImages", "worship"]
  | ["localImages", "contactHero"]
  | ["localImages", "donateHero"]
  | ["localImages", "storyHero"]
  | ["localImages", "leaderOne"]
  | ["localImages", "leaderTwo"]
  | ["localImages", "leaderThree"];

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

function getSlotUrl(bundle: SiteMediaBundle, path: SiteMediaSlotPath): string {
  const [group, key] = path;
  if (group === "websiteUseImages") {
    return bundle.websiteUseImages[key] ?? "";
  }
  return bundle.localImages[key] ?? "";
}

/** Patch a single banner slot from the latest DB bundle and delete the previous storage object. */
export async function updateSiteMediaSlotAction(
  path: SiteMediaSlotPath,
  url: string
): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");

  const { supabase } = await requireAdminUser();

  const stored = await getSiteContentValue<SiteMediaBundle>(SITE_MEDIA_CONTENT_KEY);
  const base = sanitizeMediaBundle(stored);

  const next: SiteMediaBundle = {
    ...base,
    websiteUseImages: { ...base.websiteUseImages },
    localImages: { ...base.localImages },
    brandAssets: { ...base.brandAssets },
  };

  const previousUrl = getSlotUrl(base, path);
  const [group, key] = path;
  if (group === "websiteUseImages") {
    next.websiteUseImages = { ...next.websiteUseImages, [key]: url };
  } else {
    next.localImages = { ...next.localImages, [key]: url };
  }

  // If a derived list still points at the previous URL, point it at the new one.
  next.homePillars = (next.homePillars ?? []).map((p) =>
    p.img === previousUrl ? { ...p, img: url } : p
  );
  next.aboutStoryImages = (next.aboutStoryImages ?? []).map((img) =>
    img === previousUrl ? url : img
  );
  next.founderTimelineImages = (next.founderTimelineImages ?? []).map((img) =>
    img === previousUrl ? url : img
  );

  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, next);

  if (previousUrl && previousUrl !== url && previousUrl !== EMPTY_IMAGE) {
    await deletePreviousMediaUrl(supabase, previousUrl);
  }

  revalidatePublicSite();
  return next;
}

/** Reset all content image slots to empty placeholders; keep logos. */
export async function resetContentMediaToPlaceholdersAction(): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const stored = await getSiteContentValue<SiteMediaBundle>(SITE_MEDIA_CONTENT_KEY);
  const empty = sanitizeMediaBundle(null);
  const next: SiteMediaBundle = {
    ...empty,
    brandAssets: {
      ...empty.brandAssets,
      ...(stored?.brandAssets ?? {}),
    },
  };

  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, next);
  revalidatePublicSite();
  return next;
}
