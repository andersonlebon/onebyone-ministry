"use client";

import { createContext, useContext } from "react";

import type { SiteContentBundle } from "@/lib/site-content/types";

const SiteContentContext = createContext<SiteContentBundle | null>(null);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContentBundle;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

/** Published posts for public pages. */
export function usePublishedPosts() {
  const { posts } = useSiteContent();
  return posts.filter((p) => p.published);
}
