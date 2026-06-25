"use client";

import { createContext, useContext } from "react";

import { PLACEHOLDER_MEDIA } from "@/lib/media/placeholders";
import type { SiteMediaBundle } from "@/lib/media/types";

const MediaContext = createContext<SiteMediaBundle>(PLACEHOLDER_MEDIA);

export function MediaProvider({
  media,
  children,
}: {
  media: SiteMediaBundle;
  children: React.ReactNode;
}) {
  return <MediaContext.Provider value={media}>{children}</MediaContext.Provider>;
}

/** Resolved site media. Uses Supabase URLs after setup; local placeholders before. */
export function useSiteMedia() {
  return useContext(MediaContext);
}
