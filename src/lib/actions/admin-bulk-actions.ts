"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { jobSeekers, employers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Approves all job seekers whose registration status is 'pending'.
 * This action is restricted to admin users.
 * @returns {Promise<{success: boolean, message: string, approvedCount: number}>} An object indicating the result of the operation.
 */
export async function approveAllPendingJobSeekers() {
  const session = await auth();

  // 1. Authentication and Authorization
  if (!session?.user || session.user.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: You must be an admin to perform this action.",
      approvedCount: 0,
    };
  }

  try {
    // 2. Find all pending job seekers
    const pendingSeekers = await db
      .select({ id: jobSeekers.id })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "pending"));
    
    if (pendingSeekers.length === 0) {
      return {
        success: true,
        message: "No pending job seekers to approve.",
        approvedCount: 0,
      };
    }

    const seekerIdsToApprove = pendingSeekers.map(s => s.id);

    // 3. Perform the bulk update
    const result = await db
      .update(jobSeekers)
      .set({ registrationStatus: "approved" })
      .where(eq(jobSeekers.registrationStatus, "pending"));
    
    // The 'result' from Drizzle 2.0+ on pg might not be what you expect.
    // We rely on the count of IDs we fetched earlier.
    const approvedCount = seekerIdsToApprove.length;

    // 4. Revalidate the cache for the admin page
    revalidatePath("/admin/users/jobseekers");
    
    return {
      success: true,
      message: `Successfully approved ${approvedCount} job seeker(s).`,
      approvedCount,
    };

  } catch (error) {
    console.error("Failed to bulk approve job seekers:", error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
      approvedCount: 0,
    };
  }
}

/**
 * Verifies all employers who are currently not verified.
 * This action is restricted to admin users.
 * @returns {Promise<{success: boolean, message: string, verifiedCount: number}>} An object indicating the result of the operation.
 */
export async function verifyAllPendingEmployers() {
  const session = await auth();

  // 1. Authentication and Authorization
  if (!session?.user || session.user.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: You must be an admin to perform this action.",
      verifiedCount: 0,
    };
  }

  try {
    // 2. Find all unverified employers
    const unverifiedEmployers = await db
      .select({ id: employers.id })
      .from(employers)
      .where(eq(employers.isVerified, false));
    
    if (unverifiedEmployers.length === 0) {
      return {
        success: true,
        message: "No unverified employers found.",
        verifiedCount: 0,
      };
    }

    // 3. Perform the bulk update
    await db
      .update(employers)
      .set({ isVerified: true })
      .where(eq(employers.isVerified, false));
    
    const verifiedCount = unverifiedEmployers.length;

    // 4. Revalidate the cache for the employers admin page
    revalidatePath("/admin/users/employers");
    
    return {
      success: true,
      message: `Successfully verified ${verifiedCount} employer(s).`,
      verifiedCount,
    };

  } catch (error) {
    console.error("Failed to bulk verify employers:", error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
      verifiedCount: 0,
    };
  }
} 