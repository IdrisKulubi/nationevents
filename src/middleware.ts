import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/api/auth', // Auth.js routes
  '/security', // Security page is now public
  '/sentry-example-api',
  '/sentry-example-page',
  '/nxt-her/login',
  '/nxt-her/register',
  '/nxt-her/registration-success',
  '/nxt-her/debug', // Debug page for testing
];

const DASHBOARD_ROUTES = {
  job_seeker: '/dashboard',
  employer: '/employer',
  admin: '/admin',
  security: '/security',
  nxt_her_attendee: '/nxt-her/dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle trailing slashes by redirecting to a clean URL
  if (pathname.endsWith('/') && pathname.length > 1) {
    const newPath = pathname.slice(0, -1);
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Skip middleware for public routes and static assets
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = await auth();

  // If no session, redirect to appropriate login page for protected routes
  if (!session?.user?.id) {
    // For Nxt Her Summit routes, redirect to Nxt Her login
    if (pathname.startsWith('/nxt-her/')) {
      const loginUrl = new URL('/nxt-her/login', request.url);
      if (pathname !== '/nxt-her/') {
        loginUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    
    // For other routes, redirect to main login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const { user } = session;
  const userDashboard = DASHBOARD_ROUTES[user.role] || '/';

  // Centralized, simple role-based routing.
  // If a user is on a page that doesn't match their role, send them to their dashboard.
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }
  if (pathname.startsWith('/employer') && user.role !== 'employer' && user.role !== 'admin') {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }
  if (pathname.startsWith('/dashboard') && user.role !== 'job_seeker') {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }
  if (pathname.startsWith('/nxt-her/') && user.role !== 'nxt_her_attendee') {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }
  // The /security route is now public and does not require a role check.
  
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
    '/((?!api/auth|_next/static|_next/image|_ipx|favicon.ico).*)',
  ],
};
