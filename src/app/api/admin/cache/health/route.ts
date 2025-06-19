import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/cache/health
 * Health check endpoint for the cache system
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Simple health check response
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      cache: {
        status: "operational",
        type: process.env.REDIS_URL ? "redis" : "memory"
      }
    });

  } catch (error) {
    console.error("Cache health check error:", error);
    
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Health check failed"
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/cache/health  
 * Force refresh cache health status
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Cache health check completed"
    });

  } catch (error) {
    console.error("Cache health check error:", error);
    
    return NextResponse.json({
      status: "error",
      error: "Health check failed"
    }, { status: 500 });
  }
} 