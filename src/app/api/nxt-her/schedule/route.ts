import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInteractiveSchedule } from "@/lib/services/nxt-her-schedule";
import type { ScheduleFilters } from "@/lib/services/nxt-her-schedule";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "nxt_her_attendee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: ScheduleFilters = {};
    
    const days = searchParams.get("days");
    if (days) {
      filters.days = days.split(",");
    }
    
    const tracks = searchParams.get("tracks");
    if (tracks) {
      filters.tracks = tracks.split(",");
    }
    
    const pillars = searchParams.get("pillars");
    if (pillars) {
      filters.pillars = pillars.split(",");
    }
    
    const sessionTypes = searchParams.get("sessionTypes");
    if (sessionTypes) {
      filters.sessionTypes = sessionTypes.split(",");
    }
    
    const speakers = searchParams.get("speakers");
    if (speakers) {
      filters.speakers = speakers.split(",");
    }
    
    const attendanceType = searchParams.get("attendanceType");
    if (attendanceType && ["in_person", "virtual", "both"].includes(attendanceType)) {
      filters.attendanceType = attendanceType as "in_person" | "virtual" | "both";
    }
    
    const searchQuery = searchParams.get("searchQuery");
    if (searchQuery) {
      filters.searchQuery = searchQuery;
    }

    const scheduleData = await getInteractiveSchedule(session.user.email!, filters);
    
    if (!scheduleData) {
      return NextResponse.json(
        { error: "Failed to fetch schedule data" },
        { status: 500 }
      );
    }

    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error("Error fetching interactive schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}