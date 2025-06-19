import { NextRequest, NextResponse } from "next/server";
import { getUnassignedJobSeekers } from "@/lib/actions/booth-assignment-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      assignmentStatus: searchParams.get('assignmentStatus') as any || 'unassigned',
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
      experience: searchParams.get('experience') || undefined,
      education: searchParams.get('education') || undefined,
      priorityLevel: searchParams.get('priorityLevel') as any || undefined,
      searchTerm: searchParams.get('searchTerm') || undefined
    };

    const result = await getUnassignedJobSeekers(filters);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching unassigned job seekers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", data: [], total: 0 },
      { status: 500 }
    );
  }
} 