import { NextRequest, NextResponse } from "next/server";
import { assignJobSeekerToBooth } from "@/lib/actions/booth-assignment-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobSeekerId, boothId, interviewSlotId, interviewDate, interviewTime, notes, priority } = body;

    if (!jobSeekerId || !boothId) {
      return NextResponse.json(
        { success: false, error: "Job seeker ID and booth ID are required" },
        { status: 400 }
      );
    }

    const result = await assignJobSeekerToBooth({
      jobSeekerId,
      boothId,
      interviewSlotId,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      interviewTime,
      notes,
      priority: priority || "medium"
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in booth assignment API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 