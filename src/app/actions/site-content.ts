"use server";

import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/config";
import { upsertSiteContentValue } from "@/lib/db/site-content";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import type {
  FinanceDetails,
  Post,
  Project,
  SiteContentBundle,
  SiteSettings,
  Video,
} from "@/lib/site-content/types";
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

function revalidatePublicSite() {
  revalidatePath("/", "layout");
}

export async function getSiteContentAction(): Promise<SiteContentBundle> {
  return getSiteContentBundle();
}

export async function updateSettingsAction(settings: SiteSettings): Promise<SiteSettings> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.settings, settings);
  revalidatePublicSite();
  return settings;
}

export async function updatePostsAction(posts: Post[]): Promise<Post[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.posts, posts);
  revalidatePublicSite();
  return posts;
}

export async function updateProjectsAction(projects: Project[]): Promise<Project[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.projects, projects);
  revalidatePublicSite();
  return projects;
}

export async function updateVideosAction(videos: Video[]): Promise<Video[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.videos, videos);
  revalidatePublicSite();
  return videos;
}

export async function updateFinanceAction(finance: FinanceDetails): Promise<FinanceDetails> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.finance, finance);
  revalidatePublicSite();
  return finance;
}
