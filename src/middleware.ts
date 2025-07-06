import { auth } from "@/auth";
import { NextResponse } from "next/server";
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

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Get session for auth-protected routes with timeout
    const session = await Promise.race([
      auth(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 8000) // Increased timeout
      )
    ]) as any;

    // Redirect unauthenticated users to login
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control using session data (no additional DB calls)
    const userRole = session.user.role;
    
    // Special handling for employer setup flow to prevent redirect loops
    if (pathname.startsWith('/employer/setup')) {
      const { searchParams } = request.nextUrl;
      const fromCompanyOnboard = searchParams.get('from') === 'company-onboard';
      
      // Allow access if user is employer OR if they're coming from company onboard
      // This prevents redirect loops during role transitions
      if (userRole !== 'employer' && !fromCompanyOnboard) {
        console.log("Middleware: Non-employer accessing setup without company onboard flag", {
          userRole,
          fromCompanyOnboard,
          pathname
        });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      console.log("Middleware: Allowing access to employer setup", {
        userRole,
        fromCompanyOnboard,
        pathname
      });
      
      // Allow the request to proceed to setup page
      return NextResponse.next();
    }
    
    // Admin routes
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Other employer routes (not setup) - more lenient checking during transitions
    if (pathname.startsWith('/employer/') && pathname !== '/employer/setup') {
      // Allow admin access
      if (userRole === 'admin') {
        return NextResponse.next();
      }
      
      // For non-admin, non-employer users, redirect to dashboard
      if (userRole !== 'employer') {
        console.log("Middleware: Non-employer accessing employer routes", {
          userRole,
          pathname
        });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
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
    
    // Handle specific timeout errors
    if (error instanceof Error && error.message === 'Auth timeout') {
      console.error('Auth timeout in middleware - redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // For other errors, allow the request to continue but log the error
    const response = NextResponse.next();
    response.headers.set('X-Middleware-Error', 'true');
    response.headers.set('X-Error-Type', error instanceof Error ? error.name : 'Unknown');
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
