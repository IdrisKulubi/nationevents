"use server";

import db from "@/db/drizzle";
import { 
  events, 
  checkpoints, 
  systemLogs,
  users
} from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, ilike } from "drizzle-orm";

interface HuaweiEventSetup {
  name: string;
  startDate: string; // "2025-06-05"
  endDate: string;   // "2025-06-06"
  venue: string;
  address: string;
  maxAttendees: number; // 5000+
  maxEmployers: number; // 50-70
}

export async function createHuaweiJobFairEvent(data: HuaweiEventSetup) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  // Check admin access
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    throw new Error("Admin access required");
  }

  try {
    // Create the main event
    const eventId = `huawei_job_fair_${Date.now()}`;
    
    await db.insert(events).values({
      id: eventId,
      name: data.name,
      description: `The ${data.name} brings together ${data.maxAttendees}+ job seekers and ${data.maxEmployers} leading employers for a comprehensive career development experience. This flagship event features structured interviews, career workshops, and networking opportunities with industry leaders.`,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      venue: data.venue,
      address: data.address,
      maxAttendees: data.maxAttendees,
      registrationDeadline: new Date(new Date(data.startDate).getTime() - 24 * 60 * 60 * 1000), // 1 day before
      isActive: true,
      eventType: "job_fair",
      createdBy: session.user.id,
    });

    // Create essential checkpoints for crowd control
    const checkpointConfigs = [
      {
        id: `${eventId}_main_entrance`,
        name: "Main Entrance",
        location: "Building A - Ground Floor",
        checkpointType: "entry" as const,
        maxCapacity: 200,
        requiresVerification: true
      },
      {
        id: `${eventId}_registration_desk`,
        name: "Registration Desk",
        location: "Lobby Area",
        checkpointType: "registration" as const,
        maxCapacity: 100,
        requiresVerification: true
      },
      {
        id: `${eventId}_exhibition_hall`,
        name: "Exhibition Hall",
        location: "Main Event Space",
        checkpointType: "main_hall" as const,
        maxCapacity: 1000,
        requiresVerification: false
      },
      {
        id: `${eventId}_booth_area_a`,
        name: "Booth Area A",
        location: "North Wing",
        checkpointType: "booth_area" as const,
        maxCapacity: 300,
        requiresVerification: false
      },
      {
        id: `${eventId}_booth_area_b`,
        name: "Booth Area B",
        location: "South Wing", 
        checkpointType: "booth_area" as const,
        maxCapacity: 300,
        requiresVerification: false
      },
      {
        id: `${eventId}_interview_zone`,
        name: "Interview Zone",
        location: "Second Floor",
        checkpointType: "booth_area" as const,
        maxCapacity: 500,
        requiresVerification: true
      },
      {
        id: `${eventId}_exit_point`,
        name: "Exit Point",
        location: "Building A - Ground Floor",
        checkpointType: "exit" as const,
        maxCapacity: 200,
        requiresVerification: false
      }
    ];

    // Insert all checkpoints
    await db.insert(checkpoints).values(
      checkpointConfigs.map(config => ({
        ...config,
        eventId,
        isActive: true,
        currentOccupancy: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    // Log the system action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: "create_huawei_event",
      resource: "event",
      resourceId: eventId,
      details: {
        eventName: data.name,
        expectedAttendees: data.maxAttendees,
        expectedEmployers: data.maxEmployers,
        checkpointsCreated: checkpointConfigs.length,
        dates: `${data.startDate} to ${data.endDate}`
      },
      success: true,
      createdAt: new Date()
    });

    return {
      success: true,
      eventId,
      message: `${data.name} created successfully with ${checkpointConfigs.length} checkpoints`,
      data: {
        eventId,
        checkpointsCreated: checkpointConfigs.length,
        eventDates: `${data.startDate} to ${data.endDate}`,
        capacityPlanning: {
          totalAttendees: data.maxAttendees,
          totalEmployers: data.maxEmployers,
          checkpoints: checkpointConfigs.length,
          estimatedBatches: Math.ceil(data.maxAttendees / 500) // 500 per batch
        }
      }
    };

  } catch (error) {
    console.error("Error creating Huawei job fair event:", error);
    
    // Log the error
    await db.insert(systemLogs).values({
      id: `log_error_${Date.now()}`,
      userId: session.user.id,
      action: "create_huawei_event",
      resource: "event",
      details: { error: String(error) },
      success: false,
      errorMessage: String(error),
      createdAt: new Date()
    });

    throw new Error("Failed to create Huawei job fair event");
  }
}

export async function generateCapacityPlan(maxAttendees: number, eventDuration: number = 2) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const hoursPerDay = 9; // 8 AM to 5 PM
  const totalHours = eventDuration * hoursPerDay;
  
  // Calculate optimal batch sizes for smooth flow
  const batchesPerHour = 2; // Every 30 minutes
  const totalBatches = totalHours * batchesPerHour;
  const attendeesPerBatch = Math.ceil(maxAttendees / totalBatches);
  
  const capacityPlan = {
    eventDuration: eventDuration,
    totalAttendees: maxAttendees,
    totalBatches: totalBatches,
    attendeesPerBatch: attendeesPerBatch,
    batchFrequency: "Every 30 minutes",
    recommendedCheckpoints: 7,
    estimatedPeakHours: ["10:00-12:00", "14:00-16:00"],
    safetyMargin: "15% capacity buffer",
    calculations: {
      peakHourCapacity: Math.ceil(attendeesPerBatch * 1.5),
      regularHourCapacity: attendeesPerBatch,
      emergencyCapacity: Math.ceil(attendeesPerBatch * 0.5)
    }
  };

  return capacityPlan;
}

export async function setupHuaweiJobFair2025() {
  const huaweiEventConfig: HuaweiEventSetup = {
    name: "Huawei Nation Job Fair 2025",
    startDate: "2025-06-05",
    endDate: "2025-06-06", 
    venue: "University of Nairobi Grounds",
    address: "University Way, Nairobi, Kenya",
    maxAttendees: 5000,
    maxEmployers: 70
  };

  const result = await createHuaweiJobFairEvent(huaweiEventConfig);
  const capacityPlan = await generateCapacityPlan(5000, 2);

  return {
    ...result,
    capacityPlan
  };
}

export async function getHuaweiEventStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    // Find Huawei events
    const huaweiEvents = await db
      .select()
      .from(events)
      .where(
        and(
          ilike(events.name, "%Huawei%"),
          eq(events.isActive, true)
        )
      );

    if (huaweiEvents.length === 0) {
      return {
        exists: false,
        message: "No active Huawei events found",
        recommendation: "Run setupHuaweiJobFair2025() to create the event"
      };
    }

    const event = huaweiEvents[0];
    
    // Get checkpoint status
    const checkpointCount = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.eventId, event.id));

    return {
      exists: true,
      event: {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        venue: event.venue,
        maxAttendees: event.maxAttendees
      },
      infrastructure: {
        checkpoints: checkpointCount.length,
        isReady: checkpointCount.length >= 5
      },
      status: "ready"
    };

  } catch (error) {
    console.error("Error checking Huawei event status:", error);
    return {
      exists: false,
      error: String(error)
    };
  }
} 