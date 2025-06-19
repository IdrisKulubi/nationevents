"use server";

import { auth } from "@/lib/auth";
import db from "@/db/drizzle";
import { 
  boothAssignments, 
  jobSeekers, 
  booths, 
  users, 
  employers,
  events,
  interviewSlots 
} from "@/db/schema";
import { eq, and, desc, asc, count, sql, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Types for booth assignment operations
export interface BoothAssignmentData {
  jobSeekerId: string;
  boothId: string;
  interviewSlotId?: string;
  interviewDate?: Date;
  interviewTime?: string;
  notes?: string;
  priority?: "high" | "medium" | "low";
}

export interface BulkAssignmentData {
  assignments: BoothAssignmentData[];
  sendNotifications?: boolean;
}

export interface AssignmentFilters {
  assignmentStatus?: "unassigned" | "assigned" | "confirmed" | "completed";
  skills?: string[];
  experience?: string;
  education?: string;
  priorityLevel?: "low" | "normal" | "high";
  searchTerm?: string;
}

// Ensure admin access for assignment operations
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

/**
 * Get all unassigned job seekers with filtering options
 */
export async function getUnassignedJobSeekers(filters: AssignmentFilters = {}) {
  await ensureAdminAccess();

  try {
    // Build all conditions first
    const conditions = [
      eq(jobSeekers.registrationStatus, "approved"),
      eq(jobSeekers.assignmentStatus, filters.assignmentStatus || "unassigned")
    ];

    // Add optional filters
    if (filters.experience) {
      conditions.push(eq(jobSeekers.experience, filters.experience));
    }

    if (filters.education) {
      conditions.push(eq(jobSeekers.education, filters.education));
    }

    if (filters.priorityLevel) {
      conditions.push(eq(jobSeekers.priorityLevel, filters.priorityLevel));
    }

    const query = db
      .select({
        jobSeeker: jobSeekers,
        user: users,
        assignmentCount: sql<number>`
          COALESCE((
            SELECT COUNT(*) 
            FROM ${boothAssignments} 
            WHERE ${boothAssignments.jobSeekerId} = ${jobSeekers.id}
          ), 0)
        `.as('assignment_count')
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(and(...conditions));

    let results = await query.orderBy(
      desc(jobSeekers.priorityLevel),
      asc(jobSeekers.createdAt)
    );

    // Apply client-side filters for complex queries
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter(item => 
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.jobSeeker.bio?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(item => 
        item.jobSeeker.skills?.some(skill => 
          filters.skills!.some(filterSkill => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    return {
      success: true,
      data: results,
      total: results.length
    };

  } catch (error) {
    console.error("Error fetching unassigned job seekers:", error);
    return {
      success: false,
      error: "Failed to fetch unassigned job seekers",
      data: [],
      total: 0
    };
  }
}

/**
 * Get available booths for assignment
 */
export async function getAvailableBooths() {
  await ensureAdminAccess();

  try {
    const availableBooths = await db
      .select({
        booth: booths,
        employer: employers,
        event: events,
        assignmentCount: sql<number>`
          COALESCE((
            SELECT COUNT(*) 
            FROM ${boothAssignments} 
            WHERE ${boothAssignments.boothId} = ${booths.id}
            AND ${boothAssignments.status} IN ('assigned', 'confirmed')
          ), 0)
        `.as('assignment_count'),
        slotCount: sql<number>`
          COALESCE((
            SELECT COUNT(*) 
            FROM ${interviewSlots} 
            WHERE ${interviewSlots.boothId} = ${booths.id}
          ), 0)
        `.as('slot_count')
      })
      .from(booths)
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .leftJoin(events, eq(events.id, booths.eventId))
      .where(eq(booths.isActive, true))
      .orderBy(asc(booths.boothNumber));

    return {
      success: true,
      data: availableBooths
    };

  } catch (error) {
    console.error("Error fetching available booths:", error);
    return {
      success: false,
      error: "Failed to fetch available booths",
      data: []
    };
  }
}

/**
 * Assign a single job seeker to a booth
 */
export async function assignJobSeekerToBooth(assignmentData: BoothAssignmentData) {
  const { session } = await ensureAdminAccess();

  try {
    // Validate job seeker exists and is unassigned
    const jobSeeker = await db
      .select()
      .from(jobSeekers)
      .where(
        and(
          eq(jobSeekers.id, assignmentData.jobSeekerId),
          eq(jobSeekers.registrationStatus, "approved")
        )
      )
      .limit(1);

    if (!jobSeeker[0]) {
      return {
        success: false,
        error: "Job seeker not found or not approved"
      };
    }

    // Validate booth exists
    const booth = await db
      .select()
      .from(booths)
      .where(
        and(
          eq(booths.id, assignmentData.boothId),
          eq(booths.isActive, true)
        )
      )
      .limit(1);

    if (!booth[0]) {
      return {
        success: false,
        error: "Booth not found or inactive"
      };
    }

    // Check if job seeker is already assigned to this booth
    const existingAssignment = await db
      .select()
      .from(boothAssignments)
      .where(
        and(
          eq(boothAssignments.jobSeekerId, assignmentData.jobSeekerId),
          eq(boothAssignments.boothId, assignmentData.boothId),
          inArray(boothAssignments.status, ["assigned", "confirmed"])
        )
      )
      .limit(1);

    if (existingAssignment[0]) {
      return {
        success: false,
        error: "Job seeker is already assigned to this booth"
      };
    }

    const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create booth assignment
    await db.transaction(async (tx) => {
      // Insert assignment
      await tx.insert(boothAssignments).values({
        id: assignmentId,
        jobSeekerId: assignmentData.jobSeekerId,
        boothId: assignmentData.boothId,
        interviewSlotId: assignmentData.interviewSlotId || null,
        assignedBy: session.user.id,
        interviewDate: assignmentData.interviewDate || null,
        interviewTime: assignmentData.interviewTime || null,
        notes: assignmentData.notes || null,
        priority: assignmentData.priority || "medium",
        status: "assigned"
      });

      // Update job seeker assignment status
      await tx
        .update(jobSeekers)
        .set({
          assignmentStatus: "assigned",
          updatedAt: new Date()
        })
        .where(eq(jobSeekers.id, assignmentData.jobSeekerId));

      // If interview slot is specified, mark it as booked
      if (assignmentData.interviewSlotId) {
        await tx
          .update(interviewSlots)
          .set({
            isBooked: true,
            updatedAt: new Date()
          })
          .where(eq(interviewSlots.id, assignmentData.interviewSlotId));
      }
    });

    revalidatePath("/admin/booth-assignments");
    revalidatePath("/admin/users/jobseekers");

    return {
      success: true,
      message: "Job seeker assigned to booth successfully",
      assignmentId
    };

  } catch (error) {
    console.error("Error assigning job seeker to booth:", error);
    return {
      success: false,
      error: "Failed to assign job seeker to booth"
    };
  }
}

/**
 * Bulk assign multiple job seekers to booths
 */
export async function bulkAssignJobSeekers(bulkData: BulkAssignmentData) {
  const { session } = await ensureAdminAccess();

  try {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process assignments in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < bulkData.assignments.length; i += batchSize) {
      const batch = bulkData.assignments.slice(i, i + batchSize);
      
      for (const assignment of batch) {
        try {
          const result = await assignJobSeekerToBooth(assignment);
          results.push({
            jobSeekerId: assignment.jobSeekerId,
            boothId: assignment.boothId,
            success: result.success,
            error: result.error
          });

          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          results.push({
            jobSeekerId: assignment.jobSeekerId,
            boothId: assignment.boothId,
            success: false,
            error: "Assignment failed"
          });
          failureCount++;
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    revalidatePath("/admin/booth-assignments");
    revalidatePath("/admin/users/jobseekers");

    return {
      success: successCount > 0,
      message: `Bulk assignment completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: bulkData.assignments.length,
        successful: successCount,
        failed: failureCount
      }
    };

  } catch (error) {
    console.error("Error in bulk assignment:", error);
    return {
      success: false,
      error: "Bulk assignment failed",
      results: [],
      summary: {
        total: bulkData.assignments.length,
        successful: 0,
        failed: bulkData.assignments.length
      }
    };
  }
}

/**
 * Update booth assignment status
 */
export async function updateAssignmentStatus(
  assignmentId: string, 
  status: "assigned" | "confirmed" | "completed" | "cancelled" | "no_show",
  notes?: string
) {
  await ensureAdminAccess();

  try {
    const assignment = await db
      .select()
      .from(boothAssignments)
      .where(eq(boothAssignments.id, assignmentId))
      .limit(1);

    if (!assignment[0]) {
      return {
        success: false,
        error: "Assignment not found"
      };
    }

    await db.transaction(async (tx) => {
      // Update assignment status
      await tx
        .update(boothAssignments)
        .set({
          status,
          notes: notes || assignment[0].notes,
          updatedAt: new Date()
        })
        .where(eq(boothAssignments.id, assignmentId));

      // Update job seeker assignment status based on booth assignment status
      let jobSeekerStatus: "unassigned" | "assigned" | "confirmed" | "completed";
      switch (status) {
        case "cancelled":
          jobSeekerStatus = "unassigned";
          break;
        case "confirmed":
          jobSeekerStatus = "confirmed";
          break;
        case "completed":
          jobSeekerStatus = "completed";
          break;
        default:
          jobSeekerStatus = "assigned";
      }

      await tx
        .update(jobSeekers)
        .set({
          assignmentStatus: jobSeekerStatus,
          updatedAt: new Date()
        })
        .where(eq(jobSeekers.id, assignment[0].jobSeekerId));

      // If cancelled, free up the interview slot
      if (status === "cancelled" && assignment[0].interviewSlotId) {
        await tx
          .update(interviewSlots)
          .set({
            isBooked: false,
            updatedAt: new Date()
          })
          .where(eq(interviewSlots.id, assignment[0].interviewSlotId));
      }
    });

    revalidatePath("/admin/booth-assignments");
    revalidatePath("/admin/users/jobseekers");

    return {
      success: true,
      message: "Assignment status updated successfully"
    };

  } catch (error) {
    console.error("Error updating assignment status:", error);
    return {
      success: false,
      error: "Failed to update assignment status"
    };
  }
}

/**
 * Get assignment statistics for dashboard
 */
export async function getAssignmentStatistics() {
  await ensureAdminAccess();

  try {
    // Get job seeker statistics
    const jobSeekerStats = await db
      .select({
        assignmentStatus: jobSeekers.assignmentStatus,
        count: count()
      })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "approved"))
      .groupBy(jobSeekers.assignmentStatus);

    // Get booth assignment statistics
    const assignmentStats = await db
      .select({
        status: boothAssignments.status,
        count: count()
      })
      .from(boothAssignments)
      .groupBy(boothAssignments.status);

    // Get booth utilization
    const boothUtilization = await db
      .select({
        boothId: booths.id,
        boothNumber: booths.boothNumber,
        companyName: employers.companyName,
        assignmentCount: sql<number>`
          COALESCE((
            SELECT COUNT(*) 
            FROM ${boothAssignments} 
            WHERE ${boothAssignments.boothId} = ${booths.id}
            AND ${boothAssignments.status} IN ('assigned', 'confirmed')
          ), 0)
        `.as('assignment_count'),
        slotCount: sql<number>`
          COALESCE((
            SELECT COUNT(*) 
            FROM ${interviewSlots} 
            WHERE ${interviewSlots.boothId} = ${booths.id}
          ), 0)
        `.as('slot_count')
      })
      .from(booths)
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .where(eq(booths.isActive, true))
      .orderBy(desc(sql`assignment_count`));

    // Get recent assignments
    const recentAssignments = await db
      .select({
        assignment: boothAssignments,
        jobSeeker: jobSeekers,
        user: users,
        booth: booths,
        employer: employers
      })
      .from(boothAssignments)
      .leftJoin(jobSeekers, eq(jobSeekers.id, boothAssignments.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .leftJoin(booths, eq(booths.id, boothAssignments.boothId))
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .orderBy(desc(boothAssignments.assignedAt))
      .limit(10);

    return {
      success: true,
      data: {
        jobSeekerStats,
        assignmentStats,
        boothUtilization,
        recentAssignments
      }
    };

  } catch (error) {
    console.error("Error fetching assignment statistics:", error);
    return {
      success: false,
      error: "Failed to fetch assignment statistics",
      data: null
    };
  }
}

/**
 * Get all booth assignments with filtering
 */
export async function getBoothAssignments(filters: {
  status?: string;
  boothId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
} = {}) {
  await ensureAdminAccess();

  try {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(boothAssignments.status, filters.status as any));
    }

    if (filters.boothId) {
      conditions.push(eq(boothAssignments.boothId, filters.boothId));
    }

    if (filters.dateFrom) {
      conditions.push(sql`${boothAssignments.assignedAt} >= ${filters.dateFrom}`);
    }

    if (filters.dateTo) {
      conditions.push(sql`${boothAssignments.assignedAt} <= ${filters.dateTo}`);
    }

    const query = db
      .select({
        assignment: boothAssignments,
        jobSeeker: jobSeekers,
        user: users,
        booth: booths,
        employer: employers,
        event: events
      })
      .from(boothAssignments)
      .leftJoin(jobSeekers, eq(jobSeekers.id, boothAssignments.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .leftJoin(booths, eq(booths.id, boothAssignments.boothId))
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .leftJoin(events, eq(events.id, booths.eventId))
      .where(and(...conditions));

    let results = await query.orderBy(desc(boothAssignments.assignedAt));

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter(item => 
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.employer?.companyName?.toLowerCase().includes(searchLower) ||
        item.booth?.boothNumber?.toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      data: results,
      total: results.length
    };

  } catch (error) {
    console.error("Error fetching booth assignments:", error);
    return {
      success: false,
      error: "Failed to fetch booth assignments",
      data: [],
      total: 0
    };
  }
}

/**
 * Remove booth assignment
 */
export async function removeBoothAssignment(assignmentId: string) {
  await ensureAdminAccess();

  try {
    const assignment = await db
      .select()
      .from(boothAssignments)
      .where(eq(boothAssignments.id, assignmentId))
      .limit(1);

    if (!assignment[0]) {
      return {
        success: false,
        error: "Assignment not found"
      };
    }

    await db.transaction(async (tx) => {
      // Delete the assignment
      await tx
        .delete(boothAssignments)
        .where(eq(boothAssignments.id, assignmentId));

      // Update job seeker status back to unassigned
      await tx
        .update(jobSeekers)
        .set({
          assignmentStatus: "unassigned",
          updatedAt: new Date()
        })
        .where(eq(jobSeekers.id, assignment[0].jobSeekerId));

      // Free up interview slot if assigned
      if (assignment[0].interviewSlotId) {
        await tx
          .update(interviewSlots)
          .set({
            isBooked: false,
            updatedAt: new Date()
          })
          .where(eq(interviewSlots.id, assignment[0].interviewSlotId));
      }
    });

    revalidatePath("/admin/booth-assignments");
    revalidatePath("/admin/users/jobseekers");

    return {
      success: true,
      message: "Assignment removed successfully"
    };

  } catch (error) {
    console.error("Error removing booth assignment:", error);
    return {
      success: false,
      error: "Failed to remove assignment"
    };
  }
} 