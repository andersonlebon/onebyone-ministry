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

const { getCanonicalSiteUrl, isProductionCanonicalHost } = await import("../src/lib/site-url");

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

const donationRequired = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "DONATION_RATE_LIMIT_SECRET",
] as const;
const donationConfigured = donationRequired.some((key) => process.env[key]?.trim());
if (donationConfigured) {
  for (const key of donationRequired) {
    if (!process.env[key]?.trim()) {
      console.error(`MISSING  ${key} (required when card donations are enabled)`);
      ok = false;
    } else {
      console.log(`OK       ${key}`);
    }
  }
} else {
  console.warn("INFO     Stripe card donations are not configured in this environment.");
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
  console.warn("INFO     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is optional for hosted Checkout.");
}

try {
  const canonical = new URL(getCanonicalSiteUrl());
  const productionCheck =
    process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION_SEO === "1";
  if (productionCheck && !isProductionCanonicalHost(canonical.hostname)) {
    console.error(
      `INVALID  NEXT_PUBLIC_SITE_URL resolved to ${canonical.origin}; production must use https://www.onebyoneministries.org`
    );
    ok = false;
  } else if (
    canonical.hostname.includes("localhost") ||
    canonical.hostname.endsWith(".vercel.app") ||
    canonical.hostname === "onebyoneministries.org"
  ) {
    console.warn(
      `WARN     NEXT_PUBLIC_SITE_URL is ${canonical.origin} (fine for local/preview, not for Vercel production).`
    );
  } else {
    console.log(`OK       canonical origin ${canonical.origin}`);
  }
} catch {
  console.error("INVALID  NEXT_PUBLIC_SITE_URL could not be parsed");
  ok = false;
}

if (process.env.DATABASE_URL?.includes(":5432/")) {
  console.warn("WARN     DATABASE_URL uses port 5432. Use Transaction pooler 6543 on Vercel.");
}

process.exit(ok ? 0 : 1);
