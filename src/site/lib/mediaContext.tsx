"use client";

import { createContext, useContext } from "react";

import { withMediaCacheBust } from "@/lib/media/cache-bust";
import { PLACEHOLDER_MEDIA } from "@/lib/media/placeholders";
import type { SiteMediaBundle } from "@/lib/media/types";

export type PublicAlbum = {
  id: string;
  name: string;
  slug: string;
};

type MediaContextValue = {
  media: SiteMediaBundle;
  version: number | null;
  albums: PublicAlbum[];
};

const MediaContext = createContext<MediaContextValue>({
  media: PLACEHOLDER_MEDIA,
  version: null,
  albums: [],
});

export function MediaProvider({
  media,
  version = null,
  albums = [],
  children,
}: {
  media: SiteMediaBundle;
  version?: number | null;
  albums?: PublicAlbum[];
  children: React.ReactNode;
}) {
  return (
    <MediaContext.Provider value={{ media, version, albums }}>{children}</MediaContext.Provider>
  );
}

/** Resolved site media. Uses Supabase URLs after setup; local placeholders before. */
export function useSiteMedia() {
  return useContext(MediaContext).media;
}

export function useMediaVersion() {
  return useContext(MediaContext).version;
}

export function usePhotoAlbums() {
  return useContext(MediaContext).albums;
}

/** Same cache-busted URL the public site uses for a stored media path. */
export function useMediaUrl(url: string) {
  const version = useMediaVersion();
  return withMediaCacheBust(url, version);
}
