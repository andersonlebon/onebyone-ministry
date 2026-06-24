import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

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
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

// drizzle-kit does not load Next.js env files automatically
loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const databaseUrl = process.env.DATABASE_URL_MIGRATE ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL. Add it to .env.local (Supabase → Project Settings → Database → Connection string)."
  );
}

/**
 * drizzle-kit push introspects the full schema and hangs on Supabase's
 * Transaction pooler (port 6543). Use Session pooler (5432) or set DATABASE_URL_MIGRATE.
 */
function getDrizzleDatabaseUrl(url: string) {
  if (url.includes(":6543/")) {
    console.warn(
      "[drizzle] Transaction pooler (6543) can hang on db:push. Using Session pooler (5432) instead."
    );
    return url.replace(":6543/", ":5432/");
  }
  return url;
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDrizzleDatabaseUrl(databaseUrl),
  },
});
