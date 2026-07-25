import { revalidatePath } from "next/cache";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/donate",
  "/projects",
  "/photos",
  "/videos",
  "/stories",
] as const;

/** Invalidate public + admin layouts so DB-backed content appears immediately. */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path, "page");
  }
}

/**
 * Lighter cache bust for album/photo library changes.
 * Only touch the public Photos page. Do NOT revalidate /admin layout here:
 * that layout reloads media/content/donations and was crashing the Photo Library
 * RSC after delete when the DB was under load.
 */
export function revalidatePhotoGallery() {
  revalidatePath("/photos", "page");
}
