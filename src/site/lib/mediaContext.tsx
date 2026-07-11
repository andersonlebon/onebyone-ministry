"use client";

import { createContext, useContext } from "react";

import { withMediaCacheBust } from "@/lib/media/cache-bust";
import { PLACEHOLDER_MEDIA } from "@/lib/media/placeholders";
import type { SiteMediaBundle } from "@/lib/media/types";

type MediaContextValue = {
  media: SiteMediaBundle;
  version: number | null;
};

const MediaContext = createContext<MediaContextValue>({
  media: PLACEHOLDER_MEDIA,
  version: null,
});

export function MediaProvider({
  media,
  version = null,
  children,
}: {
  media: SiteMediaBundle;
  version?: number | null;
  children: React.ReactNode;
}) {
  return <MediaContext.Provider value={{ media, version }}>{children}</MediaContext.Provider>;
}

/** Resolved site media. Uses Supabase URLs after setup; local placeholders before. */
export function useSiteMedia() {
  return useContext(MediaContext).media;
}

export function useMediaVersion() {
  return useContext(MediaContext).version;
}

/** Same cache-busted URL the public site uses for a stored media path. */
export function useMediaUrl(url: string) {
  const version = useMediaVersion();
  return withMediaCacheBust(url, version);
}
