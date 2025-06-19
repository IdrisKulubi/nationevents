import { NextRequest, NextResponse } from "next/server";
import { bulkAssignJobSeekers } from "@/lib/actions/booth-assignment-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignments, sendNotifications } = body;

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { success: false, error: "Assignments array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Validate each assignment
    for (const assignment of assignments) {
      if (!assignment.jobSeekerId || !assignment.boothId) {
        return NextResponse.json(
          { success: false, error: "Each assignment must have jobSeekerId and boothId" },
          { status: 400 }
        );
      }
    }

    const result = await bulkAssignJobSeekers({
      assignments: assignments.map(assignment => ({
        ...assignment,
        interviewDate: assignment.interviewDate ? new Date(assignment.interviewDate) : undefined
      })),
      sendNotifications: sendNotifications || false
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in bulk assignment API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 