import type { SiteMediaBundle } from "./types";

/** Replace `/assets/...` strings in a media bundle with Supabase public URLs. */
export function applyUrlMapToMediaBundle(
  bundle: SiteMediaBundle,
  urlMap: Record<string, string>
): SiteMediaBundle {
  return deepReplaceUrls(bundle, urlMap);
}

function deepReplaceUrls<T>(value: T, urlMap: Record<string, string>): T {
  if (typeof value === "string") {
    return (urlMap[value] ?? value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepReplaceUrls(item, urlMap)) as T;
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = deepReplaceUrls(nested, urlMap);
    }
    return out as T;
  }

  return value;
}
