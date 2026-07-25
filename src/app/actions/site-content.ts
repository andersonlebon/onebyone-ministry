"use server";

import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/config";
import { upsertSiteContentValue } from "@/lib/db/site-content";
import { getSiteContentBundle } from "@/lib/site-content/resolve";
import { revalidatePublicSite } from "@/lib/site-content/revalidate";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import { normalizePosts } from "@/lib/site-content/posts";
import { mergeAboutContent, sanitizeAboutForWrite } from "@/lib/site-content/about-defaults";
import type {
  AboutLocation,
  AboutPageContent,
  AboutPeopleListKey,
  AboutPerson,
  AboutTimelineMilestone,
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

async function readAboutFromDb(): Promise<AboutPageContent> {
  const { getSiteContentValue } = await import("@/lib/db/site-content");
  const stored = await getSiteContentValue<AboutPageContent>(SITE_CONTENT_KEYS.about);
  return mergeAboutContent(stored);
}

async function writeAbout(about: AboutPageContent): Promise<AboutPageContent> {
  const clean = sanitizeAboutForWrite(about);
  await upsertSiteContentValue(SITE_CONTENT_KEYS.about, clean);
  revalidatePublicSite();
  revalidatePath("/about");
  return clean;
}

/** Replace or merge About page fields (story, vision, headings, locations, etc.). */
export async function updateAboutAction(
  patch: Partial<AboutPageContent>
): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const current = await readAboutFromDb();
  return writeAbout({ ...current, ...patch });
}

function peopleList(about: AboutPageContent, list: AboutPeopleListKey): AboutPerson[] {
  return [...about[list]].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveAboutPersonAction(
  list: AboutPeopleListKey,
  input: Omit<AboutPerson, "id"> & { id?: string }
): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readAboutFromDb();
  const rows = peopleList(current, list);
  const socialLinks = Array.isArray(input.socialLinks)
    ? input.socialLinks.filter((s) => s.url?.trim())
    : [];

  if (input.id) {
    const exists = rows.some((p) => p.id === input.id);
    if (!exists) {
      rows.push({ ...input, id: input.id, socialLinks });
    } else {
      const next = rows.map((p) =>
        p.id === input.id ? { ...p, ...input, id: input.id, socialLinks } : p
      );
      return writeAbout({ ...current, [list]: next });
    }
  } else {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const sortOrder =
      typeof input.sortOrder === "number"
        ? input.sortOrder
        : rows.reduce((max, p) => Math.max(max, p.sortOrder), -1) + 1;
    rows.push({ ...input, id, sortOrder, socialLinks });
  }

  return writeAbout({ ...current, [list]: rows });
}

export async function deleteAboutPersonAction(
  list: AboutPeopleListKey,
  id: string
): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readAboutFromDb();
  return writeAbout({
    ...current,
    [list]: current[list].filter((p) => p.id !== id),
  });
}

/** @deprecated Prefer saveAboutPersonAction("team", …) */
export async function saveTeamMemberAction(
  input: Omit<AboutPerson, "id"> & { id?: string }
): Promise<AboutPageContent> {
  return saveAboutPersonAction("team", input);
}

/** @deprecated Prefer deleteAboutPersonAction("team", id) */
export async function deleteTeamMemberAction(id: string): Promise<AboutPageContent> {
  return deleteAboutPersonAction("team", id);
}

export async function saveAboutLocationAction(
  input: AboutLocation
): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readAboutFromDb();
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordinates are out of range.");
  }

  const locations = current.locations.map((loc) =>
    loc.id === input.id
      ? {
          ...loc,
          label: input.label.trim() || loc.label,
          description: input.description.trim(),
          lat,
          lng,
        }
      : loc
  );

  if (!locations.some((loc) => loc.id === input.id)) {
    locations.push({
      id: input.id,
      label: input.label.trim() || "Location",
      description: input.description.trim(),
      lat,
      lng,
    });
  }

  return writeAbout({ ...current, locations });
}

export async function saveTimelineMilestoneAction(
  input: Omit<AboutTimelineMilestone, "id"> & { id?: string }
): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readAboutFromDb();
  const timeline = [...current.timeline];

  if (input.id) {
    const exists = timeline.some((m) => m.id === input.id);
    if (!exists) {
      timeline.push({ ...input, id: input.id });
    } else {
      return writeAbout({
        ...current,
        timeline: timeline.map((m) => (m.id === input.id ? { ...m, ...input, id: input.id } : m)),
      });
    }
  } else {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    timeline.push({ ...input, id });
  }

  return writeAbout({ ...current, timeline });
}

export async function deleteTimelineMilestoneAction(id: string): Promise<AboutPageContent> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();

  const current = await readAboutFromDb();
  return writeAbout({ ...current, timeline: current.timeline.filter((m) => m.id !== id) });
}
