import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/api/auth', // Auth.js routes
  '/sentry-example-api',
  '/sentry-example-page',
];

const DASHBOARD_ROUTES = {
  job_seeker: '/dashboard',
  employer: '/employer',
  admin: '/admin',
  security: '/security',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and internal Next.js paths
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Allow all public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  const session = await auth();

  // If no session, redirect to login page
  if (!session?.user?.id) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const { user } = session;

  // Role-based access control
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.job_seeker, request.url));
  }
  if (pathname.startsWith('/security') && user.role !== 'security' && user.role !== 'admin') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.job_seeker, request.url));
  }
  if (pathname.startsWith('/employer') && user.role !== 'employer' && user.role !== 'admin') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.job_seeker, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, but we handle /api/auth explicitly)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
