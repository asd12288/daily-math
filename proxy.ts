// proxy.ts - Next.js 16 route protection
// Replaces middleware.ts with the new proxy pattern
// This provides OPTIMISTIC redirects for better UX
// Real auth verification happens in the DAL (lib/dal.ts)

import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Proxy function - Next.js 16 pattern (replaces middleware)
 * Runs on Node.js runtime by default
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes (require authentication)
  const isProtectedRoute =
    pathname.includes("/dashboard") ||
    pathname.includes("/profile") ||
    pathname.includes("/practice") ||
    pathname.includes("/settings") ||
    pathname.includes("/history");

  // Define auth routes (only for unauthenticated users)
  const isAuthRoute =
    pathname.includes("/auth/login") ||
    pathname.includes("/auth/register") ||
    pathname.includes("/auth/forgot-password");

  // Quick cookie check (optimistic, NOT secure by itself)
  // Real verification happens in DAL when fetching data
  const hasSession = request.cookies.has("session");

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathParts = pathname.split("/").filter(Boolean);
  const locale = pathParts[0] === "en" || pathParts[0] === "he" ? pathParts[0] : "en";

  // Optimistic redirect: Protected route without session cookie
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  // Optimistic redirect: Auth route with session cookie
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Continue to i18n middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - _next (Next.js internals)
  // - static files (files with extensions)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
