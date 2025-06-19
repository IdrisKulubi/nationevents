"use server";

import db from "@/db/drizzle";
import { securityPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SetupData {
  userId: string;
  badgeNumber: string;
  department: string;
  clearanceLevel: string;
}

export async function setupSecurityProfile(data: SetupData) {
  try {
    // Check if badge number is already taken
    const existingBadge = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.badgeNumber, data.badgeNumber))
      .limit(1);

    if (existingBadge[0]) {
      return {
        success: false,
        message: "Badge number is already in use. Please contact your supervisor."
      };
    }

    // Check if user already has a security profile
    const existingProfile = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.userId, data.userId))
      .limit(1);

    if (existingProfile[0]) {
      return {
        success: false,
        message: "Security profile already exists for this user."
      };
    }

    // Create security personnel profile
    await db.insert(securityPersonnel).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      badgeNumber: data.badgeNumber,
      department: data.department,
      clearanceLevel: data.clearanceLevel as any,
      assignedCheckpoints: [], // Will be assigned by admin later
      isOnDuty: false,
    });

    return {
      success: true,
      message: "Security profile created successfully! Welcome to the security team."
    };

  } catch (error) {
    console.error("Security setup error:", error);
    return {
      success: false,
      message: "Failed to create security profile. Please try again."
    };
  }
} 