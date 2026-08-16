const DEFAULT_SITE_URL = "https://www.onebyoneministries.org";
const PRODUCTION_HOST = "www.onebyoneministries.org";

function normalizeOrigin(value: string) {
  const url = new URL(value);
  if (url.hostname === "onebyoneministries.org") {
    url.hostname = PRODUCTION_HOST;
  }
  return url.origin;
}

/** Canonical public site origin (always prefer www for the production domain). */
export function getCanonicalSiteUrl(fallbackOrigin?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) {
    try {
      return normalizeOrigin(fromEnv);
    } catch {
      /* fall through */
    }
  }

  if (fallbackOrigin) {
    try {
      return normalizeOrigin(fallbackOrigin);
    } catch {
      /* fall through */
    }
  }

  return DEFAULT_SITE_URL;
}

export function isProductionCanonicalHost(hostname: string) {
  return hostname === PRODUCTION_HOST;
}

export function adminDashboardPath() {
  return "/admin/dashboard";
}

/** Full-page navigation target after admin login (avoids stale RSC fetches). */
export function adminDashboardUrl(fallbackOrigin?: string) {
  return `${getCanonicalSiteUrl(fallbackOrigin)}${adminDashboardPath()}`;
}
