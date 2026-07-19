"use server";

import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/config";
import { upsertSiteContentValue } from "@/lib/db/site-content";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { revalidatePublicSite } from "@/lib/site-content/revalidate";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import { normalizePosts } from "@/lib/site-content/posts";
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
  const normalized = normalizePosts(posts);
  await upsertSiteContentValue(SITE_CONTENT_KEYS.posts, normalized);
  revalidatePublicSite();
  revalidatePath("/stories");
  return normalized;
}

export async function updateProjectsAction(projects: Project[]): Promise<Project[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await upsertSiteContentValue(SITE_CONTENT_KEYS.projects, projects);
  revalidatePublicSite();
  revalidatePath("/projects");
  return projects;
}

async function readProjectsFromDb(): Promise<Project[]> {
  const { getSiteContentValue } = await import("@/lib/db/site-content");
  const stored = await getSiteContentValue<Project[]>(SITE_CONTENT_KEYS.projects);
  return Array.isArray(stored) ? stored : [];
}

/** Create or update one project by reading the latest DB list first (avoids stale client overwrites). */
export async function saveProjectAction(
  input: Omit<Project, "id"> & { id?: string }
): Promise<Project[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readProjectsFromDb();
  let next: Project[];

  if (input.id) {
    const exists = current.some((p) => p.id === input.id);
    if (!exists) {
      next = [{ ...input, id: input.id }, ...current];
    } else {
      next = current.map((p) => (p.id === input.id ? { ...p, ...input, id: input.id } : p));
    }
  } else {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    next = [{ ...input, id }, ...current];
  }

  await upsertSiteContentValue(SITE_CONTENT_KEYS.projects, next);
  revalidatePublicSite();
  revalidatePath("/projects");
  return next;
}

export async function deleteProjectAction(id: string): Promise<Project[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readProjectsFromDb();
  const next = current.filter((p) => p.id !== id);
  await upsertSiteContentValue(SITE_CONTENT_KEYS.projects, next);
  revalidatePublicSite();
  revalidatePath("/projects");
  return next;
}

export async function archiveProjectAction(id: string): Promise<Project[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readProjectsFromDb();
  const next = current.map((p) => (p.id === id ? { ...p, status: "Archived" as const } : p));
  await upsertSiteContentValue(SITE_CONTENT_KEYS.projects, next);
  revalidatePublicSite();
  revalidatePath("/projects");
  return next;
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
