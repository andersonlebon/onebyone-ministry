"use server";

import { upsertSiteContentValue } from "@/lib/db/site-content";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getPublicMediaBundle, SITE_MEDIA_CONTENT_KEY } from "@/lib/media/resolve";
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

export async function getPublicMediaAction(): Promise<SiteMediaBundle> {
  return getPublicMediaBundle();
}

export async function updateSiteMediaAction(media: SiteMediaBundle): Promise<SiteMediaBundle> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  await requireAdminUser();
  await upsertSiteContentValue(SITE_MEDIA_CONTENT_KEY, media);

  return media;
}
