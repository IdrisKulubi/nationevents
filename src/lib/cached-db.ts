import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  events, 
  jobSeekers,
  booths,
  interviewSlots,
  attendanceRecords,
  securityIncidents,
  securityPersonnel
} from "@/db/schema";
import { eq, desc, count, and, gte, lte, sql, asc } from "drizzle-orm";
import { cacheManager, CACHE_KEYS, CACHE_TTL } from "./redis";

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get user by ID with caching
 */
export async function getUserById(userId: string, forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.USERS,
    userId,
    async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get user by email with caching
 */
export async function getUserByEmail(email: string, forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.USERS,
    `email:${email}`,
    async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get all users with caching and filtering
 */
export async function getAllUsers(filters?: {
  role?: string;
  status?: string;
  search?: string;
}, forceRefresh: boolean = false) {
  const cacheKey = `all:${JSON.stringify(filters || {})}`;
  
  return cacheManager.getOrSet(
    CACHE_KEYS.USERS,
    cacheKey,
    async () => {
      // Apply filters
      const conditions = [];
      if (filters?.role && filters.role !== "all") {
        conditions.push(eq(users.role, filters.role as any));
      }
      if (filters?.status === "active") {
        conditions.push(eq(users.isActive, true));
      } else if (filters?.status === "inactive") {
        conditions.push(eq(users.isActive, false));
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(users)
          .where(and(...conditions))
          .orderBy(desc(users.createdAt));
      } else {
        return await db
          .select()
          .from(users)
          .orderBy(desc(users.createdAt));
      }
    },
    CACHE_TTL.SHORT, // Users list changes frequently
    forceRefresh
  );
}

// ============================================================================
// JOB SEEKER OPERATIONS
// ============================================================================

/**
 * Get job seeker by ID with caching
 */
export async function getJobSeekerById(jobSeekerId: string, forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.JOBSEEKERS,
    jobSeekerId,
    async () => {
      const result = await db
        .select()
        .from(jobSeekers)
        .where(eq(jobSeekers.id, jobSeekerId))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get job seeker by user ID with caching
 */
export async function getJobSeekerByUserId(userId: string, forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.JOBSEEKERS,
    `user:${userId}`,
    async () => {
      const result = await db
        .select()
        .from(jobSeekers)
        .where(eq(jobSeekers.userId, userId))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get all job seekers with caching
 */
export async function getAllJobSeekers(filters?: {
  status?: string;
  huaweiStudent?: boolean;
}, forceRefresh: boolean = false) {
  const cacheKey = `all:${JSON.stringify(filters || {})}`;
  
  return cacheManager.getOrSet(
    CACHE_KEYS.JOBSEEKERS,
    cacheKey,
    async () => {
      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(jobSeekers.registrationStatus, filters.status as any));
      }
      if (filters?.huaweiStudent !== undefined) {
        conditions.push(eq(jobSeekers.isHuaweiStudent, filters.huaweiStudent));
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(jobSeekers)
          .where(and(...conditions))
          .orderBy(desc(jobSeekers.createdAt));
      } else {
        return await db
          .select()
          .from(jobSeekers)
          .orderBy(desc(jobSeekers.createdAt));
      }
    },
    CACHE_TTL.SHORT,
    forceRefresh
  );
}

// ============================================================================
// EMPLOYER OPERATIONS
// ============================================================================

/**
 * Get employer by ID with caching
 */
export async function getEmployerById(employerId: string, forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.EMPLOYERS,
    employerId,
    async () => {
      const result = await db
        .select()
        .from(employers)
        .where(eq(employers.id, employerId))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get all employers with caching
 */
export async function getAllEmployers(filters?: {
  verification?: string;
  status?: string;
}, forceRefresh: boolean = false) {
  const cacheKey = `all:${JSON.stringify(filters || {})}`;
  
  return cacheManager.getOrSet(
    CACHE_KEYS.EMPLOYERS,
    cacheKey,
    async () => {
      const conditions = [];
      if (filters?.verification === "verified") {
        conditions.push(eq(employers.isVerified, true));
      } else if (filters?.verification === "unverified") {
        conditions.push(eq(employers.isVerified, false));
      }

      const baseQuery = db.select({
        id: employers.id,
        userId: employers.userId,
        companyName: employers.companyName,
        contactPerson: employers.contactPerson,
        industry: employers.industry,
        companySize: employers.companySize,
        website: employers.website,
        isVerified: employers.isVerified,
        createdAt: employers.createdAt,
        userRole: users.role,
        userEmail: users.email,
        userIsActive: users.isActive,
        contactEmail: employers.contactEmail,
        contactPhone: employers.contactPhone,
        logoUrl: employers.logoUrl,
      }).from(employers).leftJoin(users, eq(employers.userId, users.id));

      if (conditions.length > 0) {
        return await baseQuery
          .where(and(...conditions))
          .orderBy(desc(employers.createdAt));
      } else {
        return await baseQuery
          .orderBy(desc(employers.createdAt));
      }
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Get current active event with caching
 */
export async function getCurrentEvent(forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.EVENTS,
    'current',
    async () => {
      const result = await db
        .select()
        .from(events)
        .where(eq(events.isActive, true))
        .orderBy(asc(events.startDate))
        .limit(1);
      return result[0] || null;
    },
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
}

/**
 * Get all events with caching
 */
export async function getAllEvents(forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.EVENTS,
    'all',
    async () => {
      return await db
        .select()
        .from(events)
        .orderBy(desc(events.startDate));
    },
    CACHE_TTL.LONG, // Events don't change frequently
    forceRefresh
  );
}

// ============================================================================
// DASHBOARD ANALYTICS WITH CACHING
// ============================================================================

/**
 * Get dashboard statistics with caching
 */
export async function getDashboardStats(forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.DASHBOARD_STATS,
    'main',
    async () => {
      const [
        totalUsersResult,
        newRegistrationsResult,
        employersResult,
        activeEventsResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),
        db.select({ count: count() }).from(employers).where(eq(employers.isVerified, true)),        
        db.select({ count: count() }).from(events).where(eq(events.isActive, true)),
      ]);

      return {
        totalUsers: totalUsersResult[0]?.count || 0,
        newRegistrations: newRegistrationsResult[0]?.count || 0,
        employers: employersResult[0]?.count || 0,
        activeEvents: activeEventsResult[0]?.count || 0,
        lastUpdated: new Date().toISOString()
      };
    },
    CACHE_TTL.DASHBOARD,
    forceRefresh
  );
}

/**
 * Get attendance analytics with caching
 */
export async function getAttendanceAnalytics(period: 'day' | 'week' | 'month' = 'week', forceRefresh: boolean = false) {
  return cacheManager.getOrSet(
    CACHE_KEYS.ANALYTICS,
    `attendance:${period}`,
    async () => {
      const periodMs = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      const startDate = new Date(Date.now() - periodMs[period]);

      const attendanceData = await db
        .select({
          date: sql<string>`DATE(${attendanceRecords.checkInTime})`,
          count: count()
        })
        .from(attendanceRecords)
        .where(gte(attendanceRecords.checkInTime, startDate))
        .groupBy(sql`DATE(${attendanceRecords.checkInTime})`)
        .orderBy(sql`DATE(${attendanceRecords.checkInTime})`);

      return {
        period,
        data: attendanceData,
        lastUpdated: new Date().toISOString()
      };
    },
    CACHE_TTL.ANALYTICS,
    forceRefresh
  );
}

// ============================================================================
// CACHE INVALIDATION METHODS
// ============================================================================

/**
 * Invalidate user-related caches
 */
export async function invalidateUserCache(userId: string) {
  await Promise.all([
    cacheManager.delete(CACHE_KEYS.USERS, userId),
    cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS)
  ]);
}

/**
 * Invalidate job seeker-related caches
 */
export async function invalidateJobSeekerCache(jobSeekerId: string, userId?: string) {
  await Promise.all([
    cacheManager.delete(CACHE_KEYS.JOBSEEKERS, jobSeekerId),
    userId ? cacheManager.delete(CACHE_KEYS.JOBSEEKERS, `user:${userId}`) : Promise.resolve(),      
    cacheManager.invalidatePattern(CACHE_KEYS.JOBSEEKERS),
    cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS)
  ]);
}

/**
 * Invalidate employer-related caches
 */
export async function invalidateEmployerCache(employerId: string) {
  await Promise.all([
    cacheManager.delete(CACHE_KEYS.EMPLOYERS, employerId),
    cacheManager.invalidatePattern(CACHE_KEYS.EMPLOYERS),
    cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS)
  ]);
}

/**
 * Invalidate event-related caches
 */
export async function invalidateEventCache() {
  await Promise.all([
    cacheManager.invalidatePattern(CACHE_KEYS.EVENTS),
    cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS)
  ]);
}

/**
 * Invalidate dashboard cache
 */
export async function invalidateDashboardCache() {
  await cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS);
}

/**
 * Clear all caches (use with caution)
 */
export async function clearAllCaches() {
  await Promise.all([
    cacheManager.invalidatePattern(CACHE_KEYS.USERS),
    cacheManager.invalidatePattern(CACHE_KEYS.JOBSEEKERS),
    cacheManager.invalidatePattern(CACHE_KEYS.EMPLOYERS),
    cacheManager.invalidatePattern(CACHE_KEYS.EVENTS),
    cacheManager.invalidatePattern(CACHE_KEYS.DASHBOARD_STATS),
    cacheManager.invalidatePattern(CACHE_KEYS.ANALYTICS)
  ]);
}

// Export direct database instance for operations that shouldn't be cached
export { db as directDB }; 