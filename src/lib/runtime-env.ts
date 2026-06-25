/** True during local `next dev`. Stripped to false in production builds. */
export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

/**
 * Demo donations, seeded admin store, demo login, sample analytics, placeholder finance.
 * Opt in on preview/staging with NEXT_PUBLIC_DEMO_CONTENT=true.
 */
export function isDemoContentEnabled() {
  if (process.env.NEXT_PUBLIC_DEMO_CONTENT === "true") return true;
  return isDevelopment();
}

export function isProductionBuild() {
  return process.env.NODE_ENV === "production";
}
