import type { SiteMediaBundle } from "./types";

/** Append a version query param so browsers/CDNs fetch fresh Supabase objects after admin saves. */
export function withMediaCacheBust(url: string, version: number | null | undefined): string {
  if (!url || version == null) return url;
  if (!url.startsWith("http")) return url;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return url;

  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${version}`;
}

function bustMediaValue<T>(value: T, version: number): T {
  if (typeof value === "string") {
    return withMediaCacheBust(value, version) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => bustMediaValue(item, version)) as T;
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = bustMediaValue(nested, version);
    }
    return out as T;
  }

  return value;
}

export function applyMediaCacheBust(
  bundle: SiteMediaBundle,
  version: number | null | undefined
): SiteMediaBundle {
  if (version == null) return bundle;
  return bustMediaValue(bundle, version);
}
