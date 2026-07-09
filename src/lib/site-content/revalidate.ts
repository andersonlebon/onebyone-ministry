import { revalidatePath } from "next/cache";

/** Invalidate the public site layout so DB-backed content appears immediately. */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
}
