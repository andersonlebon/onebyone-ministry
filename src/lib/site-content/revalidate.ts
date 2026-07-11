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
