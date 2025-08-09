import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/api/auth", // Auth.js routes
  "/nxt-her/login",
  "/nxt-her/register",
  "/nxt-her/registration-success",
  "/nxt-her/debug", // Debug page for testing
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle trailing slashes by redirecting to a clean URL
  if (pathname.endsWith("/") && pathname.length > 1) {
    const newPath = pathname.slice(0, -1);
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Skip middleware for public routes and static assets
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = await auth();

  // If no session, redirect to Nxt Her login for all protected routes
  if (!session?.user?.id) {
    const loginUrl = new URL("/nxt-her/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const { user } = session;

  // Since we only support Nxt Her attendees, redirect any non-Nxt Her routes to the dashboard
  if (!pathname.startsWith("/nxt-her/") && pathname !== "/") {
    return NextResponse.redirect(new URL("/nxt-her/dashboard", request.url));
  }

  // Let page components handle more complex logic like profile completion.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _ipx (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|_ipx|favicon.ico).*)",
  ],
};
