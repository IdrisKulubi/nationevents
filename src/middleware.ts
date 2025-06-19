import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/actions/user-actions";
import type { NextRequest } from "next/server";
import { cacheManager } from "@/lib/redis";

// Rate limiting configuration
const RATE_LIMITS = {
  api: { requests: 100, window: 60 }, // 100 requests per minute for API endpoints
  auth: { requests: 30, window: 60 }, // 30 auth attempts per minute (increased for login pages)
  admin: { requests: 200, window: 60 }, // 200 requests per minute for admin users
  general: { requests: 100, window: 60 }, // 100 requests per minute for general users (increased)
  public: { requests: 200, window: 60 }, // 200 requests per minute for public pages
} as const;

// Get client IP address
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous'
  );
}

// Get rate limit key
function getRateLimitKey(request: NextRequest, type: string): string {
  const ip = getClientIP(request);
  return `${ip}:${type}`;
}

// Apply rate limiting
async function applyRateLimit(
  request: NextRequest, 
  type: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const config = RATE_LIMITS[type];
    const key = getRateLimitKey(request, type);
    
    return await cacheManager.rateLimit(key, config.requests, config.window);
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fallback: allow request if rate limiting fails
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000
    };
  }
}

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/login',
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

  // In development, be more lenient with rate limiting
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Check if this is a public route first
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Apply rate limiting based on path
    let rateLimitType: keyof typeof RATE_LIMITS = 'general';
    
    if (isPublicRoute) {
      rateLimitType = 'public'; // Use more lenient rate limiting for public routes
    } else if (pathname.startsWith('/api/auth/')) {
      rateLimitType = 'auth'; // Only API auth endpoints get strict auth limits
    } else if (pathname.startsWith('/api/')) {
      rateLimitType = 'api';
    } else if (pathname.startsWith('/admin/')) {
      rateLimitType = 'admin';
    }

    const rateLimit = await applyRateLimit(request, rateLimitType);
    
    // In development, only enforce rate limiting for API routes
    if (!rateLimit.allowed && (!isDevelopment || pathname.startsWith('/api/'))) {
      const response = new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMITS[rateLimitType].requests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
      
      return response;
    }

    // Get session for auth-protected routes (only if not a public route)
    const session = !isPublicRoute ? await auth() : null;

    if (isPublicRoute) {
      const response = NextResponse.next();
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].requests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      
      return response;
    }

    // Redirect unauthenticated users to login
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

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

    // Add security headers and rate limit info
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].requests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    
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
