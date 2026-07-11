import { eq } from "drizzle-orm";

import { getDb } from "./index";
import { siteContent } from "./schema";

export async function getSiteContentValue<T>(key: string): Promise<T | null> {
  const row = await getSiteContentRow(key);
  return (row?.value as T) ?? null;
}

export async function getSiteContentRow(key: string) {
  const db = getDb();
  const [row] = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
  return row ?? null;
}

export async function upsertSiteContentValue(key: string, value: unknown) {
  const db = getDb();

  await db
    .insert(siteContent)
    .values({ key, value })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value, updatedAt: new Date() },
    });
}
