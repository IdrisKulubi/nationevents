import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleSessionBookmark } from "@/lib/services/nxt-her-agenda";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "nxt_her_attendee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const isBookmarked = await toggleSessionBookmark(session.user.email!, sessionId);
    
    return NextResponse.json({ 
      success: true, 
      isBookmarked,
      message: isBookmarked ? "Session bookmarked" : "Bookmark removed"
    });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}