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

const PROFILE_SETUP_ROUTES = {
  job_seeker: '/profile-setup',
  employer: '/employer/setup',
};

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

  const { role, profileCompleted } = session.user;

  // If profile is not complete, redirect to the appropriate setup page
  if (!profileCompleted) {
    const setupPath = PROFILE_SETUP_ROUTES[role as keyof typeof PROFILE_SETUP_ROUTES];
    if (setupPath && pathname !== setupPath) {
      console.log(`Middleware: Profile incomplete. Redirecting to ${setupPath} for role ${role}.`);
      return NextResponse.redirect(new URL(setupPath, request.url));
    }
  }

  // If profile IS complete, prevent access to setup pages
  if (profileCompleted) {
    const setupPath = PROFILE_SETUP_ROUTES[role as keyof typeof PROFILE_SETUP_ROUTES];
    if (setupPath && pathname === setupPath) {
      const dashboardPath = DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] || '/';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Role-based access control for protected routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.job_seeker, request.url));
  }
  if (pathname.startsWith('/employer') && role !== 'employer' && role !== 'admin') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.job_seeker, request.url));
  }
  if (pathname.startsWith('/security') && role !== 'security') {
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
