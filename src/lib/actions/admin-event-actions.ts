"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  events, 
  checkpoints, 
  booths, 
  systemLogs,
  users
} from "@/db/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CreateEventData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  maxAttendees: number;
  eventType: "job_fair" | "career_expo" | "networking";
  registrationDeadline: string;
  isActive: boolean;
}

interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

async function ensureAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    throw new Error("Admin access required");
  }

  return { session, user: user[0] };
}

export async function createEvent(data: CreateEventData) {
  try {
    const { session, user } = await ensureAdminAccess();

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const registrationDeadline = new Date(data.registrationDeadline);

    if (startDate >= endDate) {
      return { 
        success: false, 
        error: "End date must be after start date" 
      };
    }

    if (registrationDeadline >= startDate) {
      return { 
        success: false, 
        error: "Registration deadline must be before event start date" 
      };
    }

    // If this is the first active event, deactivate others
    if (data.isActive) {
      await db
        .update(events)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(events.isActive, true));
    }

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(events).values({
      id: eventId,
      name: data.name,
      description: data.description,
      startDate,
      endDate,
      venue: data.venue,
      address: data.address,
      maxAttendees: data.maxAttendees,
      eventType: data.eventType,
      registrationDeadline,
      isActive: data.isActive,
      createdBy: session.user.id,
    });

    // Create default checkpoints for job fairs
    if (data.eventType === "job_fair") {
      const defaultCheckpoints = [
        {
          id: `${eventId}_main_entrance`,
          name: "Main Entrance",
          location: "Building Main Floor",
          checkpointType: "entry" as const,
          maxCapacity: Math.min(200, Math.floor(data.maxAttendees * 0.2)),
          requiresVerification: true
        },
        {
          id: `${eventId}_registration`,
          name: "Registration Desk",
          location: "Lobby Area",
          checkpointType: "registration" as const,
          maxCapacity: Math.min(100, Math.floor(data.maxAttendees * 0.1)),
          requiresVerification: true
        },
        {
          id: `${eventId}_main_hall`,
          name: "Main Event Hall",
          location: "Central Area",
          checkpointType: "main_hall" as const,
          maxCapacity: Math.floor(data.maxAttendees * 0.6),
          requiresVerification: false
        },
        {
          id: `${eventId}_networking`,
          name: "Networking Area",
          location: "Side Hall",
          checkpointType: "booth_area" as const,
          maxCapacity: Math.floor(data.maxAttendees * 0.3),
          requiresVerification: false
        }
      ];

      await db.insert(checkpoints).values(
        defaultCheckpoints.map(checkpoint => ({
          ...checkpoint,
          eventId,
          isActive: true,
          currentOccupancy: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }

    // Log the action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: "create_event",
      resource: "event",
      resourceId: eventId,
      details: {
        eventName: data.name,
        eventType: data.eventType,
        maxAttendees: data.maxAttendees,
        venue: data.venue,
        checkpointsCreated: data.eventType === "job_fair" ? 4 : 0
      },
      success: true,
      createdAt: new Date()
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "Event created successfully",
      eventId,
      data: {
        eventId,
        checkpointsCreated: data.eventType === "job_fair" ? 4 : 0
      }
    };

  } catch (error) {
    console.error("Error creating event:", error);
    return { 
      success: false, 
      error: "Failed to create event. Please try again." 
    };
  }
}

export async function updateEvent(data: UpdateEventData) {
  try {
    const { session } = await ensureAdminAccess();

    const eventExists = await db
      .select()
      .from(events)
      .where(eq(events.id, data.id))
      .limit(1);

    if (!eventExists[0]) {
      return { 
        success: false, 
        error: "Event not found" 
      };
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        return { 
          success: false, 
          error: "End date must be after start date" 
        };
      }
    }

    // If setting as active, deactivate others
    if (data.isActive) {
      await db
        .update(events)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(events.isActive, true));
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update provided fields
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.venue) updateData.venue = data.venue;
    if (data.address) updateData.address = data.address;
    if (data.maxAttendees) updateData.maxAttendees = data.maxAttendees;
    if (data.eventType) updateData.eventType = data.eventType;
    if (data.registrationDeadline) updateData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, data.id));

    // Log the action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: "update_event",
      resource: "event",
      resourceId: data.id,
      details: { updatedFields: Object.keys(updateData) },
      success: true,
      createdAt: new Date()
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "Event updated successfully" 
    };

  } catch (error) {
    console.error("Error updating event:", error);
    return { 
      success: false, 
      error: "Failed to update event. Please try again." 
    };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const { session } = await ensureAdminAccess();

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event[0]) {
      return { 
        success: false, 
        error: "Event not found" 
      };
    }

    // Check if event has associated data
    const [checkpointCount, boothCount] = await Promise.all([
      db.select({ count: count() })
        .from(checkpoints)
        .where(eq(checkpoints.eventId, eventId)),
      db.select({ count: count() })
        .from(booths)
        .where(eq(booths.eventId, eventId))
    ]);

    if (checkpointCount[0]?.count > 0 || boothCount[0]?.count > 0) {
      return {
        success: false,
        error: "Cannot delete event with associated checkpoints or booths. Please remove them first."
      };
    }

    await db.delete(events).where(eq(events.id, eventId));

    // Log the action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: "delete_event",
      resource: "event",
      resourceId: eventId,
      details: { eventName: event[0].name },
      success: true,
      createdAt: new Date()
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "Event deleted successfully" 
    };

  } catch (error) {
    console.error("Error deleting event:", error);
    return { 
      success: false, 
      error: "Failed to delete event. Please try again." 
    };
  }
}

export async function toggleEventStatus(eventId: string) {
  try {
    const { session } = await ensureAdminAccess();

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event[0]) {
      return { 
        success: false, 
        error: "Event not found" 
      };
    }

    const newStatus = !event[0].isActive;

    // If activating, deactivate others
    if (newStatus) {
      await db
        .update(events)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(events.isActive, true));
    }

    await db
      .update(events)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    // Log the action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: newStatus ? "activate_event" : "deactivate_event",
      resource: "event",
      resourceId: eventId,
      details: { eventName: event[0].name, newStatus },
      success: true,
      createdAt: new Date()
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: `Event ${newStatus ? 'activated' : 'deactivated'} successfully` 
    };

  } catch (error) {
    console.error("Error toggling event status:", error);
    return { 
      success: false, 
      error: "Failed to update event status. Please try again." 
    };
  }
}

export async function getEventStats(eventId: string) {
  try {
    await ensureAdminAccess();

    const [checkpointCount, boothCount] = await Promise.all([
      db.select({ count: count() })
        .from(checkpoints)
        .where(eq(checkpoints.eventId, eventId)),
      db.select({ count: count() })
        .from(booths)
        .where(eq(booths.eventId, eventId))
    ]);

    return {
      success: true,
      stats: {
        checkpoints: checkpointCount[0]?.count || 0,
        booths: boothCount[0]?.count || 0
      }
    };

  } catch (error) {
    console.error("Error getting event stats:", error);
    return { 
      success: false, 
      error: "Failed to get event statistics" 
    };
  }
}

export async function duplicateEvent(eventId: string, newName: string) {
  try {
    const { session } = await ensureAdminAccess();

    const originalEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!originalEvent[0]) {
      return { 
        success: false, 
        error: "Original event not found" 
      };
    }

    const event = originalEvent[0];
    const newEventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new event with modified dates (1 week later)
    const oneWeekLater = 7 * 24 * 60 * 60 * 1000;
    const newStartDate = new Date(event.startDate.getTime() + oneWeekLater);
    const newEndDate = new Date(event.endDate.getTime() + oneWeekLater);
    const newRegDeadline = event.registrationDeadline 
      ? new Date(event.registrationDeadline.getTime() + oneWeekLater)
      : new Date(newStartDate.getTime() - 24 * 60 * 60 * 1000);

    await db.insert(events).values({
      id: newEventId,
      name: newName,
      description: event.description,
      startDate: newStartDate,
      endDate: newEndDate,
      venue: event.venue,
      address: event.address,
      maxAttendees: event.maxAttendees,
      eventType: event.eventType,
      registrationDeadline: newRegDeadline,
      isActive: false, // New events start inactive
      createdBy: session.user.id,
    });

    // Copy checkpoints
    const originalCheckpoints = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.eventId, eventId));

    if (originalCheckpoints.length > 0) {
      await db.insert(checkpoints).values(
        originalCheckpoints.map(checkpoint => ({
          id: `${newEventId}_${checkpoint.name.toLowerCase().replace(/\s+/g, '_')}`,
          eventId: newEventId,
          name: checkpoint.name,
          location: checkpoint.location,
          checkpointType: checkpoint.checkpointType,
          maxCapacity: checkpoint.maxCapacity,
          requiresVerification: checkpoint.requiresVerification,
          isActive: true,
          currentOccupancy: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }

    // Log the action
    await db.insert(systemLogs).values({
      id: `log_${Date.now()}`,
      userId: session.user.id,
      action: "duplicate_event",
      resource: "event",
      resourceId: newEventId,
      details: { 
        originalEventId: eventId,
        originalEventName: event.name,
        newEventName: newName,
        checkpointsCopied: originalCheckpoints.length
      },
      success: true,
      createdAt: new Date()
    });

    revalidatePath("/admin/events");

    return { 
      success: true, 
      message: "Event duplicated successfully",
      eventId: newEventId
    };

  } catch (error) {
    console.error("Error duplicating event:", error);
    return { 
      success: false, 
      error: "Failed to duplicate event. Please try again." 
    };
  }
} 