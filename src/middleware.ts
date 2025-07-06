import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/actions/user-actions";
import type { NextRequest } from "next/server";

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/login',
  '/profile-setup',
  '/company-onboard',
  '/no-access',
  '/api/auth',
  '/api/sentry-example-api',
  '/sentry-example-page',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware completely for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  try {
    // Check if this is a public route first
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Get session for auth-protected routes (only if not a public route)
    const session = !isPublicRoute ? await auth() : null;

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Profile completion checks are handled by individual pages
    // This avoids issues with cached session data not reflecting latest profile status

    // Role-based access control
    const userRole = session.user.role;
    
    // Admin routes
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Employer routes
    if (pathname.startsWith('/employer/') && userRole !== 'employer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Security routes
    if (pathname.startsWith('/security/') && userRole !== 'security') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Cache headers for static content
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Fallback to allow request if middleware fails
    const response = NextResponse.next();
    response.headers.set('X-Middleware-Error', 'true');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
