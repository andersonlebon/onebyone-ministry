import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isStaffUser, needsInvitePasswordSetup } from "./admin";
import { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login", "/admin/accept-invite"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.has(pathname);

  if (isAdminRoute && !isPublicAdminRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !isPublicAdminRoute && user && !isStaffUser(user)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("error", "not-admin");
    return NextResponse.redirect(loginUrl);
  }

  if (
    isAdminRoute &&
    !isPublicAdminRoute &&
    user &&
    isStaffUser(user) &&
    needsInvitePasswordSetup(user) &&
    pathname !== "/admin/accept-invite"
  ) {
    const inviteUrl = request.nextUrl.clone();
    inviteUrl.pathname = "/admin/accept-invite";
    inviteUrl.search = "";
    return NextResponse.redirect(inviteUrl);
  }

  if (pathname === "/admin/login" && user && isStaffUser(user)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = needsInvitePasswordSetup(user)
      ? "/admin/accept-invite"
      : "/admin/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
