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

  // Special handling for employer role to prevent redirect loops during profile creation
  if (role === 'employer') {
    // If accessing /employer but profile is incomplete, redirect to setup
    if (!profileCompleted && pathname.startsWith('/employer') && pathname !== '/employer/setup') {
      console.log(`Middleware: Employer profile incomplete. Redirecting to /employer/setup.`);
      return NextResponse.redirect(new URL('/employer/setup', request.url));
    }
    
    // If profile is complete and trying to access setup, redirect to dashboard
    if (profileCompleted && pathname === '/employer/setup') {
      console.log(`Middleware: Employer profile complete. Redirecting to /employer.`);
      return NextResponse.redirect(new URL('/employer', request.url));
    }
    
    // Allow access to setup page regardless of profile completion status
    if (pathname === '/employer/setup') {
      return NextResponse.next();
    }
  }

  // For non-employer roles, use the original logic
  if (role !== 'employer') {
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
