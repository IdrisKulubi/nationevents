"use server";

import { 
  users, 
  employers, 
  events, 
  jobs,
  booths,
  interviewSlots,
  interviewBookings,
  securityPersonnel,
  checkpoints,
  attendanceRecords,
  securityIncidents,
  feedback,
  notifications,
  systemLogs,
  jobSeekers
} from "@/db/schema";
import { eq, desc, count, sum, and, gte, lte, isNotNull, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import db from "@/db/drizzle";
import { getDashboardStats as getCachedDashboardStats, getAllUsers as getCachedAllUsers, getAllEmployers as getCachedAllEmployers } from "@/lib/cached-db";

// Types for better type safety
interface LogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: any;
  createdAt: Date;
  userName: string | null;
}

interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  role: "job_seeker" | "employer" | "admin" | "security" | null;
  isActive: boolean | null;
  isOnline: boolean | null;
  lastActive: Date | null;
  createdAt: Date;
  profilePhoto: string | null;
  phoneNumber: string | null;
}

interface EmployerRecord {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string | null;
  industry: string | null;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise" | null;
  website: string | null;
  isVerified: boolean | null;
  createdAt: Date;
  userRole: "job_seeker" | "employer" | "admin" | "security" | null;
  userEmail: string;
  userIsActive: boolean | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
}

interface SlotRecord {
  id: string;
  boothId: string;
  startTime: Date;
  endTime: Date;
  duration: number | null;
  isBooked: boolean | null;
  boothNumber: string | null;
  companyName: string | null;
}

interface BoothRecord {
  id: string;
  name: string | null;
  boothNumber: string | null;
}

// Helper function to ensure admin access
async function ensureAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user[0] || user[0].role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user[0];
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export async function getDashboardStats() {
  await ensureAdminAccess();

  try {
    // Use cached dashboard stats with fallback to database
    return await getCachedDashboardStats();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentActivity() {
  await ensureAdminAccess();

  try {
    const recentLogs = await db
      .select({
        id: systemLogs.id,
        action: systemLogs.action,
        resource: systemLogs.resource,
        details: systemLogs.details,
        createdAt: systemLogs.createdAt,
        userName: users.name
      })
      .from(systemLogs)
      .leftJoin(users, eq(systemLogs.userId, users.id))
      .orderBy(desc(systemLogs.createdAt))
      .limit(10);

    return recentLogs.map((log: typeof recentLogs[0]) => ({
      action: log.action,
      details: log.details,
      time: log.createdAt,
      user: log.userName || "System",
      type: log.resource === "security" ? "warning" : "info"
    }));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getAllUsers(filters?: {
  role?: string;
  status?: string;
  search?: string;
}) {
  await ensureAdminAccess();

  try {
    // Use cached database service for better performance
    return await getCachedAllUsers(filters);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getAllEmployers(filters?: {
  status?: string;
  verification?: string;
  search?: string;
}) {
  await ensureAdminAccess();

  try {
    // Use cached database service for better performance
    return await getCachedAllEmployers(filters);
  } catch (error) {
    console.error("Error fetching employers:", error);
    throw new Error("Failed to fetch employers");
  }
}

export async function promoteUserToAdmin(userId: string) {
  await ensureAdminAccess();

  try {
    await db
      .update(users)
      .set({ 
        role: "admin",
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      action: "promote_user",
      resource: "user",
      resourceId: userId,
      details: { newRole: "admin" }
    });

    revalidatePath("/admin/users/employers");
    return { success: true };
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw new Error("Failed to promote user to admin");
  }
}

export async function verifyEmployer(employerId: string) {
  await ensureAdminAccess();

  try {
    await db
      .update(employers)
      .set({ 
        isVerified: true,
        updatedAt: new Date()
      })
      .where(eq(employers.id, employerId));

    // Activate the user account as well
    const employer = await db.select().from(employers).where(eq(employers.id, employerId)).limit(1);
    if (employer[0]) {
      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, employer[0].userId));
    }

    await logSystemAction({
      action: "verify_employer",
      resource: "employer",
      resourceId: employerId
    });

    revalidatePath("/admin/users/employers");
    return { success: true };
  } catch (error) {
    console.error("Error verifying employer:", error);
    throw new Error("Failed to verify employer");
  }
}

export async function rejectEmployer(employerId: string) {
  await ensureAdminAccess();

  try {
    const employer = await db.select().from(employers).where(eq(employers.id, employerId)).limit(1);
    if (employer[0]) {
      await db
        .update(users)
        .set({ isActive: false })
        .where(eq(users.id, employer[0].userId));
    }

    await logSystemAction({
      action: "reject_employer",
      resource: "employer",
      resourceId: employerId
    });

    revalidatePath("/admin/users/employers");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting employer:", error);
    throw new Error("Failed to reject employer");
  }
}

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

export async function getCurrentEvent() {
  await ensureAdminAccess();

  try {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!event[0]) {
      return null;
    }

    // Get additional stats
    const [attendeesCount, checkedInCount] = await Promise.all([
      db.select({ count: count() }).from(jobSeekers),
      db.select({ count: count() })
        .from(attendanceRecords)
        .where(eq(attendanceRecords.eventId, event[0].id))
    ]);

    return {
      ...event[0],
      currentAttendees: attendeesCount[0]?.count || 0,
      checkedInAttendees: checkedInCount[0]?.count || 0
    };
  } catch (error) {
    console.error("Error fetching current event:", error);
    throw new Error("Failed to fetch current event");
  }
}

export async function updateEvent(eventId: string, eventData: {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  maxAttendees?: number;
  registrationDeadline?: string;
  eventType?: "job_fair" | "career_expo" | "networking";
}) {
  await ensureAdminAccess();

  try {
    // Convert string dates to Date objects
    const updateData: any = { ...eventData, updatedAt: new Date() };
    
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }

    await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId));

    await logSystemAction({
      action: "update_event",
      resource: "event",
      resourceId: eventId,
      details: eventData
    });

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
}

export async function toggleEventStatus(eventId: string) {
  await ensureAdminAccess();

  try {
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event[0]) {
      throw new Error("Event not found");
    }

    const newStatus = !event[0].isActive;
    await db
      .update(events)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    await logSystemAction({
      action: newStatus ? "activate_event" : "deactivate_event",
      resource: "event",
      resourceId: eventId
    });

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Error toggling event status:", error);
    throw new Error("Failed to toggle event status");
  }
}

// ============================================================================
// TIME BATCH MANAGEMENT
// ============================================================================

export async function getTimeBatches() {
  await ensureAdminAccess();

  try {
    const slots = await db
      .select({
        id: interviewSlots.id,
        boothId: interviewSlots.boothId,
        startTime: interviewSlots.startTime,
        endTime: interviewSlots.endTime,
        duration: interviewSlots.duration,
        isBooked: interviewSlots.isBooked,
        boothNumber: booths.boothNumber,
        companyName: employers.companyName
      })
      .from(interviewSlots)
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .leftJoin(employers, eq(booths.employerId, employers.id))
      .orderBy(asc(interviewSlots.startTime));

    // Group slots into batches by date
    const batchesMap = new Map();
    
    slots.forEach((slot: typeof slots[0]) => {
      const date = slot.startTime.toISOString().split('T')[0];
      const hour = slot.startTime.getHours();
      const period = hour < 13 ? 'Morning' : 'Afternoon';
      const batchKey = `${date}-${period}`;
      
      if (!batchesMap.has(batchKey)) {
        batchesMap.set(batchKey, {
          id: batchKey,
          name: `${period} Session - ${new Date(date).toLocaleDateString()}`,
          date: date,
          startTime: period === 'Morning' ? '09:00' : '13:00',
          endTime: period === 'Morning' ? '12:00' : '17:00',
          slotDuration: slot.duration || 30,
          totalSlots: 0,
          bookedSlots: 0,
          availableSlots: 0,
          status: 'active' as const,
          eventId: 'current',
          booths: new Set()
        });
      }
      
      const batch = batchesMap.get(batchKey);
      batch.totalSlots++;
      if (slot.isBooked) batch.bookedSlots++;
      batch.availableSlots = batch.totalSlots - batch.bookedSlots;
      batch.booths.add(slot.boothId);
    });

    return Array.from(batchesMap.values()).map(batch => ({
      ...batch,
      booths: Array.from(batch.booths)
    }));
  } catch (error) {
    console.error("Error fetching time batches:", error);
    throw new Error("Failed to fetch time batches");
  }
}

export async function getTimeSlots(batchId: string) {
  await ensureAdminAccess();

  try {
    // Extract date and period from batchId
    const [date, period] = batchId.split('-');
    const startHour = period === 'Morning' ? 9 : 13;
    const endHour = period === 'Morning' ? 12 : 17;

    const slots = await db
      .select({
        id: interviewSlots.id,
        startTime: interviewSlots.startTime,
        endTime: interviewSlots.endTime,
        isBooked: interviewSlots.isBooked,
        boothId: interviewSlots.boothId,
        boothName: employers.companyName,
        attendeeName: users.name,
        attendeeEmail: users.email,
        jobTitle: jobs.title
      })
      .from(interviewSlots)
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .leftJoin(employers, eq(booths.employerId, employers.id))
      .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(jobSeekers, eq(interviewBookings.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .leftJoin(jobs, eq(interviewSlots.jobId, jobs.id))
      .where(
        and(
          gte(interviewSlots.startTime, new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00`)),
          lte(interviewSlots.startTime, new Date(`${date}T${endHour.toString().padStart(2, '0')}:00:00`))
        )
      )
      .orderBy(asc(interviewSlots.startTime));

    return slots.map((slot: any) => ({
      id: slot.id,
      batchId,
      startTime: slot.startTime.toTimeString().slice(0, 5),
      endTime: slot.endTime.toTimeString().slice(0, 5),
      boothId: slot.boothId,
      boothName: slot.boothName || 'Unknown Booth',
      isBooked: slot.isBooked,
      attendeeName: slot.attendeeName,
      attendeeEmail: slot.attendeeEmail,
      jobTitle: slot.jobTitle,
      companyName: slot.boothName
    }));
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw new Error("Failed to fetch time slots");
  }
}

export async function createTimeBatch(batchData: {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  booths: string[];
}) {
  await ensureAdminAccess();

  try {
    // Get booth information
    const boothsInfo = await db
      .select()
      .from(booths)
      .where(sql`${booths.id} = ANY(${batchData.booths})`);

    // Generate time slots
    const startDateTime = new Date(`${batchData.date}T${batchData.startTime}:00`);
    const endDateTime = new Date(`${batchData.date}T${batchData.endTime}:00`);
    const durationMs = batchData.slotDuration * 60 * 1000;

    const slotsToCreate = [];
    for (const booth of boothsInfo) {
      let currentTime = new Date(startDateTime);
      while (currentTime < endDateTime) {
        const slotEndTime = new Date(currentTime.getTime() + durationMs);
        slotsToCreate.push({
          id: randomUUID(),
          boothId: booth.id,
          startTime: new Date(currentTime),
          endTime: slotEndTime,
          duration: batchData.slotDuration,
          isBooked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        currentTime = slotEndTime;
      }
    }

    // Insert all slots
    await db.insert(interviewSlots).values(slotsToCreate);

    await logSystemAction({
      action: "create_time_batch",
      resource: "time_batch",
      details: { ...batchData, totalSlots: slotsToCreate.length }
    });

    revalidatePath("/admin/events/time-batches");
    return { success: true };
  } catch (error) {
    console.error("Error creating time batch:", error);
    throw new Error("Failed to create time batch");
  }
}

export async function getAvailableBooths() {
  await ensureAdminAccess();

  try {
    const boothsData = await db
      .select({
        id: booths.id,
        name: employers.companyName,
        boothNumber: booths.boothNumber
      })
      .from(booths)
      .leftJoin(employers, eq(booths.employerId, employers.id))
      .where(eq(booths.isActive, true));

    return boothsData.map((booth: BoothRecord) => ({
      id: booth.id,
      name: booth.name || `Booth ${booth.boothNumber}`
    }));
  } catch (error) {
    console.error("Error fetching available booths:", error);
    throw new Error("Failed to fetch available booths");
  }
}

// ============================================================================
// SECURITY MANAGEMENT
// ============================================================================

export async function getSecurityPersonnel() {
  await ensureAdminAccess();

  try {
    const personnel = await db
      .select({
        id: securityPersonnel.id,
        userId: securityPersonnel.userId,
        badgeNumber: securityPersonnel.badgeNumber,
        department: securityPersonnel.department,
        clearanceLevel: securityPersonnel.clearanceLevel,
        isOnDuty: securityPersonnel.isOnDuty,
        shiftStart: securityPersonnel.shiftStart,
        shiftEnd: securityPersonnel.shiftEnd,
        assignedCheckpoints: securityPersonnel.assignedCheckpoints,
        name: users.name,
        email: users.email,
        isActive: users.isActive
      })
      .from(securityPersonnel)
      .leftJoin(users, eq(securityPersonnel.userId, users.id))
      .orderBy(asc(securityPersonnel.badgeNumber));

    return personnel;
  } catch (error) {
    console.error("Error fetching security personnel:", error);
    throw new Error("Failed to fetch security personnel");
  }
}

export async function getSecurityIncidents() {
  await ensureAdminAccess();

  try {
    const incidents = await db
      .select({
        id: securityIncidents.id,
        incidentType: securityIncidents.incidentType,
        severity: securityIncidents.severity,
        location: securityIncidents.location,
        description: securityIncidents.description,
        status: securityIncidents.status,
        createdAt: securityIncidents.createdAt,
        reportedByName: users.name,
        resolvedBy: securityIncidents.resolvedBy,
        resolvedAt: securityIncidents.resolvedAt
      })
      .from(securityIncidents)
      .leftJoin(securityPersonnel, eq(securityIncidents.reportedBy, securityPersonnel.id))
      .leftJoin(users, eq(securityPersonnel.userId, users.id))
      .orderBy(desc(securityIncidents.createdAt))
      .limit(50);

    return incidents;
  } catch (error) {
    console.error("Error fetching security incidents:", error);
    throw new Error("Failed to fetch security incidents");
  }
}

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================

export async function getAttendanceAnalytics(period: 'day' | 'week' | 'month' = 'week') {
  await ensureAdminAccess();

  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [totalAttendees, checkedInCount, checkpointData] = await Promise.all([
      db.select({ count: count() }).from(jobSeekers),
      db.select({ count: count() })
        .from(attendanceRecords)
        .where(gte(attendanceRecords.checkInTime, startDate)),
      db.select({
        checkpointName: checkpoints.name,
        count: count()
      })
        .from(attendanceRecords)
        .leftJoin(checkpoints, eq(attendanceRecords.checkpointId, checkpoints.id))
        .where(gte(attendanceRecords.checkInTime, startDate))
        .groupBy(checkpoints.name)
    ]);

    return {
      totalAttendees: totalAttendees[0]?.count || 0,
      checkedIn: checkedInCount[0]?.count || 0,
      attendanceRate: totalAttendees[0]?.count ? 
        Math.round((checkedInCount[0]?.count || 0) / totalAttendees[0].count * 100) : 0,
      checkpointBreakdown: checkpointData
    };
  } catch (error) {
    console.error("Error fetching attendance analytics:", error);
    throw new Error("Failed to fetch attendance analytics");
  }
}

export async function getUserAnalytics() {
  await ensureAdminAccess();

  try {
    const [roleDistribution, registrationTrend] = await Promise.all([
      db.select({
        role: users.role,
        count: count()
      }).from(users).groupBy(users.role),
      
      db.select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
        .from(users)
        .where(gte(users.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`)
    ]);

    return {
      roleDistribution,
      registrationTrend
    };
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw new Error("Failed to fetch user analytics");
  }
}

// ============================================================================
// SYSTEM MONITORING
// ============================================================================

export async function getSystemHealth() {
  await ensureAdminAccess();

  try {
    // This would typically check various system components
    const [dbHealth, recentErrors] = await Promise.all([
      // Simple DB health check
      db.select({ count: count() }).from(users).limit(1),
      
      // Recent error logs
      db.select({ count: count() })
        .from(systemLogs)
        .where(
          and(
            eq(systemLogs.success, false),
            gte(systemLogs.createdAt, new Date(Date.now() - 60 * 60 * 1000))
          )
        )
    ]);

    const errorCount = recentErrors[0]?.count || 0;
    const healthScore = Math.max(0, 100 - (errorCount * 5)); // Reduce score by 5 for each error

    return {
      status: healthScore >= 95 ? 'healthy' : healthScore >= 80 ? 'warning' : 'critical',
      score: healthScore,
      services: {
        database: dbHealth ? 'online' : 'offline',
        auth: 'online', // Would check auth service
        email: 'online', // Would check email service
        storage: 'online' // Would check file storage
      },
      lastChecked: new Date()
    };
  } catch (error) {
    console.error("Error checking system health:", error);
    return {
      status: 'critical' as const,
      score: 0,
      services: {
        database: 'offline',
        auth: 'unknown',
        email: 'unknown',
        storage: 'unknown'
      },
      lastChecked: new Date()
    };
  }
}

export async function getSystemLogs(limit: number = 50) {
  await ensureAdminAccess();

  try {
    const logs = await db
      .select({
        id: systemLogs.id,
        action: systemLogs.action,
        resource: systemLogs.resource,
        resourceId: systemLogs.resourceId,
        details: systemLogs.details,
        success: systemLogs.success,
        errorMessage: systemLogs.errorMessage,
        createdAt: systemLogs.createdAt,
        userName: users.name,
        userEmail: users.email
      })
      .from(systemLogs)
      .leftJoin(users, eq(systemLogs.userId, users.id))
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("Error fetching system logs:", error);
    throw new Error("Failed to fetch system logs");
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getAdminNotifications() {
  const adminUser = await ensureAdminAccess();

  try {
    const adminNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, adminUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return adminNotifications;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function markNotificationAsRead(notificationId: string) {
  await ensureAdminAccess();

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function logSystemAction(params: {
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  success?: boolean;
  errorMessage?: string;
}) {
  try {
    const session = await auth();
    await db.insert(systemLogs).values({
      id: randomUUID(),
      userId: session?.user?.id || null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      details: params.details || null,
      success: params.success ?? true,
      errorMessage: params.errorMessage || null,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error logging system action:", error);
    // Don't throw here to avoid breaking the main operation
  }
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "security_alert";
  actionUrl?: string;
  metadata?: any;
}) {
  try {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      actionUrl: params.actionUrl || null,
      metadata: params.metadata || null,
      isRead: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}

export async function changeUserRole(userId: string, newRole: "job_seeker" | "employer" | "admin" | "security") {
  await ensureAdminAccess();

  try {
    // Get current user data for logging
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    const oldRole = currentUser[0].role;

    // Update user role
    await db
      .update(users)
      .set({ 
        role: newRole,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      action: "change_user_role",
      resource: "user",
      resourceId: userId,
      details: { 
        oldRole, 
        newRole,
        userName: currentUser[0].name,
        userEmail: currentUser[0].email
      }
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/users/roles");
    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Error changing user role:", error);
    throw new Error("Failed to change user role");
  }
}

export async function toggleUserStatus(userId: string) {
  await ensureAdminAccess();

  try {
    // Get current user data
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    const newStatus = !currentUser[0].isActive;

    // Update user status
    await db
      .update(users)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      action: newStatus ? "activate_user" : "deactivate_user",
      resource: "user",
      resourceId: userId,
      details: { 
        userName: currentUser[0].name,
        userEmail: currentUser[0].email,
        newStatus
      }
    });

    revalidatePath("/admin/users");
    return { 
      success: true, 
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` 
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw new Error("Failed to update user status");
  }
}

export async function deleteUser(userId: string) {
  await ensureAdminAccess();

  try {
    // Get current user data for logging
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    // Check if user is an admin (prevent deleting other admins)
    if (currentUser[0].role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    // Start transaction to delete user and related data
    await db.transaction(async (tx) => {
      // Delete related job seeker data if exists
      await tx.delete(jobSeekers).where(eq(jobSeekers.userId, userId));
      
      // Delete related employer data if exists
      await tx.delete(employers).where(eq(employers.userId, userId));
      
      // Delete the user
      await tx.delete(users).where(eq(users.id, userId));
    });

    // Log the action
    await logSystemAction({
      action: "delete_user",
      resource: "user",
      resourceId: userId,
      details: { 
        userName: currentUser[0].name,
        userEmail: currentUser[0].email,
        userRole: currentUser[0].role
      }
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function getUserDetails(userId: string) {
  await ensureAdminAccess();

  try {
    const userDetails = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
        employer: employers
      })
      .from(users)
      .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
      .leftJoin(employers, eq(employers.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userDetails[0]) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: userDetails[0]
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}
