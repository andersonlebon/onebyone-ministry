import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";

import { defaultSiteSettings } from "../src/content/site-defaults";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env"));
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL");

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });
  try {
    const rows = await sql<{ value: Record<string, unknown> }[]>`
      SELECT value FROM site_content WHERE key = 'settings' LIMIT 1
    `;
    const merged = { ...defaultSiteSettings, ...(rows[0]?.value ?? {}) };
    await sql`
      INSERT INTO site_content (key, value, updated_at)
      VALUES ('settings', ${sql.json(merged as never)}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${sql.json(merged as never)}, updated_at = now()
    `;
    console.log("Settings merged with stats, verse, and address fields.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
