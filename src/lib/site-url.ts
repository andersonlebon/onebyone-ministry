const DEFAULT_SITE_URL = "https://www.onebyoneministries.org";

/** Canonical public site origin (always prefer www in production). */
export function getCanonicalSiteUrl(fallbackOrigin?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (fallbackOrigin) {
    try {
      const url = new URL(fallbackOrigin);
      if (url.hostname === "onebyoneministries.org") {
        url.hostname = "www.onebyoneministries.org";
      }
      return url.origin;
    } catch {
      /* fall through */
    }
  }

  return DEFAULT_SITE_URL;
}

export function adminDashboardPath() {
  return "/admin/dashboard";
}

/** Full-page navigation target after admin login (avoids stale RSC fetches). */
export function adminDashboardUrl(fallbackOrigin?: string) {
  return `${getCanonicalSiteUrl(fallbackOrigin)}${adminDashboardPath()}`;
}
