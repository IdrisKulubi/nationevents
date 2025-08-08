import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEventFeedbackCompletionStats } from "@/lib/services/nxt-her-feedback";

// GET - Get feedback completion statistics for an event
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Only allow admin users or event organizers to access completion stats
    if (!session?.user || !["admin", "nxt_her_attendee"].includes(session.user.role || "")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const stats = await getEventFeedbackCompletionStats(eventId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching feedback completion stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}