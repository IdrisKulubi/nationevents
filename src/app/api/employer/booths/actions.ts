"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { booths, employers, events, interviewSlots, users, interviewBookings } from "@/db/schema";
import { eq, and, or, gte, lte, like, desc, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBooth(formData: {
  eventId: string;
  boothNumber: string;
  location: string;
  size: "small" | "medium" | "large";
  equipment: string[];
  specialRequirements?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Check if user is admin
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    // If user is admin, they can't create booths through employer interface
    // They should use the admin interface instead
    if (user[0].role === "admin") {
      return { 
        success: false, 
        message: "Admins should use the admin booth management interface to create booths. Please go to Admin > Booth Management to create booths and assign them to companies." 
      };
    }

    // Get employer profile for non-admin users
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found. Please complete your company registration first." };
    }

    const employer = employerProfile[0];

    // Check if booth already exists for this employer and event
    const existingBooth = await db
      .select()
      .from(booths)
      .where(
        and(
          eq(booths.employerId, employer.id),
          eq(booths.eventId, formData.eventId)
        )
      )
      .limit(1);

    if (existingBooth[0]) {
      // Update existing booth
      await db
        .update(booths)
        .set({
          boothNumber: formData.boothNumber,
          location: formData.location,
          size: formData.size,
          equipment: formData.equipment,
          specialRequirements: formData.specialRequirements,
          updatedAt: new Date(),
        })
        .where(eq(booths.id, existingBooth[0].id));

      revalidatePath("/employer");
      revalidatePath("/employer/booths");
      
      return { 
        success: true, 
        message: "Booth updated successfully! 🎉",
        boothId: existingBooth[0].id
      };
    } else {
      // Create new booth
      const boothId = `booth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(booths).values({
        id: boothId,
        eventId: formData.eventId,
        employerId: employer.id,
        boothNumber: formData.boothNumber,
        location: formData.location,
        size: formData.size,
        equipment: formData.equipment,
        specialRequirements: formData.specialRequirements,
        isActive: true,
      });

      revalidatePath("/employer");
      revalidatePath("/employer/booths");
      
      return { 
        success: true, 
        message: "Booth created successfully! 🚀",
        boothId
      };
    }
  } catch (error) {
    console.error("Error creating/updating booth:", error);
    return { success: false, message: "Failed to create/update booth. Please try again." };
  }
}

export async function createInterviewSlot(formData: {
  boothId: string;
  jobId?: string;
  startTime: string;
  duration: number;
  interviewerName?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    let employer;
    
    // Handle admin users
    if (user[0].role === "admin") {
      // Admin can create slots for any booth - find the booth's employer
      const boothData = await db
        .select({
          booth: booths,
          employer: employers
        })
        .from(booths)
        .leftJoin(employers, eq(employers.id, booths.employerId))
        .where(eq(booths.id, formData.boothId))
        .limit(1);

      if (!boothData[0]) {
        return { success: false, message: "Booth not found" };
      }

      employer = boothData[0].employer;
    } else {
      // Get employer profile for regular users
      const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

      employer = employerProfile[0];

    // Verify booth belongs to this employer
    const booth = await db
      .select()
      .from(booths)
      .where(
        and(
          eq(booths.id, formData.boothId),
            eq(booths.employerId, employer.id)
          )
      )
      .limit(1);

    if (!booth[0]) {
      return { success: false, message: "Booth not found or access denied" };
      }
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(startTime.getTime() + formData.duration * 60000);

    // Check for conflicting slots in the same booth
    const conflictingSlots = await db
      .select()
      .from(interviewSlots)
      .where(
        and(
          eq(interviewSlots.boothId, formData.boothId),
          or(
            // New slot starts during existing slot
            and(
              gte(interviewSlots.startTime, startTime),
              lte(interviewSlots.startTime, endTime)
            ),
            // New slot ends during existing slot
            and(
              gte(interviewSlots.endTime, startTime),
              lte(interviewSlots.endTime, endTime)
            ),
            // New slot completely contains existing slot
            and(
              lte(interviewSlots.startTime, startTime),
              gte(interviewSlots.endTime, endTime)
            )
          )
        )
      );

    if (conflictingSlots.length > 0) {
      return { 
        success: false, 
        message: "⚠️ Time slot conflicts with existing interview. Please choose a different time." 
      };
    }

    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(interviewSlots).values({
      id: slotId,
      boothId: formData.boothId,
      jobId: formData.jobId || null,
      startTime,
      endTime,
      duration: formData.duration,
      isBooked: false,
      interviewerName: formData.interviewerName,
      notes: formData.notes,
    });

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    return { 
      success: true, 
      message: "Interview slot created successfully! 🎉",
      slotId
    };
  } catch (error) {
    console.error("Error creating interview slot:", error);
    return { success: false, message: "Failed to create interview slot. Please try again." };
  }
}

export async function updateInterviewSlot(slotId: string, formData: {
  startTime?: string;
  duration?: number;
  interviewerName?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    let whereCondition;
    
    if (user[0].role === "admin") {
      // Admin can update any slot
      whereCondition = eq(interviewSlots.id, slotId);
    } else {
      // Get employer profile for regular users
      const employerProfile = await db
        .select()
        .from(employers)
        .where(eq(employers.userId, session.user.id))
        .limit(1);

      if (!employerProfile[0]) {
        return { success: false, message: "Employer profile not found" };
      }

      // Verify slot belongs to this employer through booth
      const slot = await db
        .select({
          slot: interviewSlots,
          booth: booths,
        })
        .from(interviewSlots)
        .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
        .where(
          and(
            eq(interviewSlots.id, slotId),
            eq(booths.employerId, employerProfile[0].id)
          )
        )
        .limit(1);

      if (!slot[0]) {
        return { success: false, message: "Interview slot not found or access denied" };
      }

      if (slot[0].slot.isBooked) {
        return { success: false, message: "⚠️ Cannot update a booked interview slot" };
      }

      whereCondition = eq(interviewSlots.id, slotId);
    }

    const updateData: any = {};
    
    if (formData.startTime) {
      const newStartTime = new Date(formData.startTime);
      updateData.startTime = newStartTime;
      
      if (formData.duration) {
        updateData.endTime = new Date(newStartTime.getTime() + formData.duration * 60000);
        updateData.duration = formData.duration;
      }
    }
    
    if (formData.interviewerName !== undefined) {
      updateData.interviewerName = formData.interviewerName || null;
    }
    
    if (formData.notes !== undefined) {
      updateData.notes = formData.notes || null;
    }

    await db
      .update(interviewSlots)
      .set(updateData)
      .where(whereCondition);

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    return { success: true, message: "Interview slot updated successfully! ✅" };
  } catch (error) {
    console.error("Error updating interview slot:", error);
    return { success: false, message: "Failed to update interview slot. Please try again." };
  }
}

export async function deleteInterviewSlot(slotId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    let slot;
    
    if (user[0].role === "admin") {
      // Admin can delete any slot
      slot = await db
        .select({
          slot: interviewSlots,
        })
        .from(interviewSlots)
        .where(eq(interviewSlots.id, slotId))
        .limit(1);
    } else {
      // Get employer profile for regular users
      const employerProfile = await db
        .select()
        .from(employers)
        .where(eq(employers.userId, session.user.id))
        .limit(1);

      if (!employerProfile[0]) {
        return { success: false, message: "Employer profile not found" };
      }

      // Verify slot belongs to this employer through booth
      slot = await db
        .select({
          slot: interviewSlots,
          booth: booths,
        })
        .from(interviewSlots)
        .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
        .where(
          and(
            eq(interviewSlots.id, slotId),
            eq(booths.employerId, employerProfile[0].id)
          )
        )
        .limit(1);
    }

    if (!slot[0]) {
      return { success: false, message: "Interview slot not found or access denied" };
    }

    if (slot[0].slot.isBooked) {
      return { success: false, message: "⚠️ Cannot delete a booked interview slot. Please cancel the booking first." };
    }

    await db.delete(interviewSlots).where(eq(interviewSlots.id, slotId));

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    return { success: true, message: "Interview slot deleted successfully! 🗑️" };
  } catch (error) {
    console.error("Error deleting interview slot:", error);
    return { success: false, message: "Failed to delete interview slot. Please try again." };
  }
}

export async function bulkDeleteInterviewSlots(slotIds: string[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    if (slotIds.length === 0) {
      return { success: false, message: "No slots selected for deletion" };
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const slotId of slotIds) {
      const result = await deleteInterviewSlot(slotId);
      if (result.success) {
        deletedCount++;
      } else {
        errors.push(`${slotId}: ${result.message}`);
      }
    }

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    if (deletedCount === slotIds.length) {
      return { 
        success: true, 
        message: `Successfully deleted ${deletedCount} interview slots! 🎉` 
      };
    } else {
      return { 
        success: false, 
        message: `Deleted ${deletedCount} out of ${slotIds.length} slots. Errors: ${errors.join(", ")}` 
      };
    }
  } catch (error) {
    console.error("Error bulk deleting interview slots:", error);
    return { success: false, message: "Failed to delete interview slots. Please try again." };
  }
}

export async function searchInterviewSlots(params: {
  searchTerm?: string;
  status?: "available" | "booked" | "completed";
  dateFrom?: string;
  dateTo?: string;
  interviewerName?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required", data: [] };
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found", data: [] };
    }

    let employerId;
    
    if (user[0].role === "admin") {
      // Admin can search all slots - we'll handle this by not filtering by employer
      employerId = null;
    } else {
      // Get employer profile for regular users
      const employerProfile = await db
        .select()
        .from(employers)
        .where(eq(employers.userId, session.user.id))
        .limit(1);

      if (!employerProfile[0]) {
        return { success: false, message: "Employer profile not found", data: [] };
      }

      employerId = employerProfile[0].id;
    }

    // Build query conditions
    const conditions = [];
    
    if (employerId) {
      conditions.push(eq(booths.employerId, employerId));
    }

    if (params.dateFrom) {
      conditions.push(gte(interviewSlots.startTime, new Date(params.dateFrom)));
    }

    if (params.dateTo) {
      const endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      conditions.push(lte(interviewSlots.startTime, endDate));
    }

    if (params.interviewerName) {
      conditions.push(like(interviewSlots.interviewerName, `%${params.interviewerName}%`));
    }

    if (params.status) {
      if (params.status === "available") {
        conditions.push(eq(interviewSlots.isBooked, false));
      } else if (params.status === "booked") {
        conditions.push(eq(interviewSlots.isBooked, true));
      }
    }

    let results;
    if (conditions.length > 0) {
      results = await db
        .select({
          slot: interviewSlots,
          booking: interviewBookings,
          jobSeeker: {
            id: users.id,
            name: users.name,
            email: users.email
          },
          booth: booths,
          event: events,
        })
        .from(interviewSlots)
        .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
        .leftJoin(users, eq(users.id, interviewBookings.jobSeekerId))
        .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
        .leftJoin(events, eq(events.id, booths.eventId))
        .where(and(...conditions))
        .orderBy(desc(interviewSlots.startTime));
    } else {
      results = await db
        .select({
          slot: interviewSlots,
          booking: interviewBookings,
          jobSeeker: {
            id: users.id,
            name: users.name,
            email: users.email
          },
          booth: booths,
          event: events,
        })
        .from(interviewSlots)
        .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
        .leftJoin(users, eq(users.id, interviewBookings.jobSeekerId))
        .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
        .leftJoin(events, eq(events.id, booths.eventId))
        .orderBy(desc(interviewSlots.startTime));
    }

    // Apply text search filter
    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      results = results.filter(item => 
        item.jobSeeker?.name?.toLowerCase().includes(searchLower) ||
        item.jobSeeker?.email?.toLowerCase().includes(searchLower) ||
        item.slot.interviewerName?.toLowerCase().includes(searchLower) ||
        item.slot.notes?.toLowerCase().includes(searchLower)
      );
    }

    return { 
      success: true, 
      message: `Found ${results.length} interview slots`,
      data: results 
    };
  } catch (error) {
    console.error("Error searching interview slots:", error);
    return { success: false, message: "Failed to search interview slots", data: [] };
  }
}

export async function getEmployerBooth(eventId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return null;
    }

    if (user[0].role === "admin") {
      // Admin can access all booths, return first available booth
      const boothQuery = db
        .select({
          booth: booths,
          event: events,
        })
        .from(booths)
        .leftJoin(events, eq(events.id, booths.eventId));

      if (eventId) {
        boothQuery.where(eq(booths.eventId, eventId));
      }

      const result = await boothQuery.limit(1);
      return result[0] || null;
    }

    // Get employer profile for regular users
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return null;
    }

    const employer = employerProfile[0];

    // Get booth for this employer
    const boothConditions = [eq(booths.employerId, employer.id)];
    if (eventId) {
      boothConditions.push(eq(booths.eventId, eventId));
    }

    const result = await db
      .select({
        booth: booths,
        event: events,
      })
      .from(booths)
      .leftJoin(events, eq(events.id, booths.eventId))
      .where(and(...boothConditions))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching employer booth:", error);
    return null;
  }
} 