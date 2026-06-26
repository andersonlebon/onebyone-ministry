"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CompleteAuthResult =
  | { status: "success"; next: string }
  | { status: "error"; message: string }
  | { status: "none" };

function parseHashParams(hash: string) {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(raw);
}

export function resolveAuthNextPath(search: string, hash: string) {
  const fromQuery = new URLSearchParams(search).get("next");
  if (fromQuery) return fromQuery;

  const hashParams = parseHashParams(hash);
  const type = hashParams.get("type");
  if (type === "invite" || type === "recovery" || type === "signup") {
    return "/admin/accept-invite";
  }

  return "/admin/dashboard";
}

export function stripAuthParamsFromUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  const query = url.searchParams.toString();
  window.history.replaceState({}, "", query ? `${url.pathname}?${query}` : url.pathname);
}

/** Handle Supabase PKCE (?code=) and invite/magic-link tokens (#access_token=). */
export async function completeAuthFromUrl(
  supabase: SupabaseClient,
  location: Pick<Location, "search" | "hash">
): Promise<CompleteAuthResult> {
  const next = resolveAuthNextPath(location.search, location.hash);
  const code = new URLSearchParams(location.search).get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { status: "error", message: error.message };
    return { status: "success", next };
  }

  const hashParams = parseHashParams(location.hash);
  const access_token = hashParams.get("access_token");
  const refresh_token = hashParams.get("refresh_token");

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return { status: "error", message: error.message };
    return { status: "success", next };
  }

  return { status: "none" };
}
