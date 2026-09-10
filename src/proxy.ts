import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * This is intentionally shallow. It only checks whether a session cookie is
 * *present* — not whether it's valid — because Proxy is not the place to do
 * real authentication (that's a database round-trip, and Proxy is meant to
 * stay fast and simple). The actual session + role check lives in
 * src/app/admin/(dashboard)/layout.tsx, which runs as a Server Component
 * with full access to the database.
 *
 * This split exists on purpose: CVE-2025-29927 was exactly what happens
 * when middleware/proxy tries to be the *only* auth boundary. Treat this as
 * a redirect-for-UX layer, and the layout as the actual lock on the door.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
