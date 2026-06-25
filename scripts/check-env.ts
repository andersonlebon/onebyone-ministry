#!/usr/bin/env tsx
/**
 * Verify required env vars before /setup or production deploy.
 * Run: npx tsx scripts/check-env.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY",
] as const;

let ok = true;

for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`MISSING  ${key}`);
    ok = false;
    continue;
  }
  console.log(`OK       ${key}`);
}

if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
  console.warn("WARN     NEXT_PUBLIC_SITE_URL is localhost (fine for dev, not for Vercel production).");
}

if (process.env.DATABASE_URL?.includes(":5432/")) {
  console.warn("WARN     DATABASE_URL uses port 5432. Use Transaction pooler 6543 on Vercel.");
}

process.exit(ok ? 0 : 1);
