"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users, booths, employers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

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

export async function createAdminBooth(formData: {
  eventId: string;
  employerEmail: string;
  boothNumber: string;
  location: string;
  size: "small" | "medium" | "large";
  equipment: string[];
  specialRequirements?: string;
}) {
  try {
    await ensureAdminAccess();

    // Find the employer by email
    const employer = await db
      .select({
        employer: employers,
        user: users
      })
      .from(employers)
      .leftJoin(users, eq(users.id, employers.userId))
      .where(eq(users.email, formData.employerEmail))
      .limit(1);

    if (!employer[0]) {
      // Check if user exists but no employer profile
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.email, formData.employerEmail))
        .limit(1);

      if (userExists[0]) {
        return { 
          success: false, 
          message: `User with email ${formData.employerEmail} exists but has no employer profile. Please ask them to complete their company registration first.` 
        };
      } else {
        return { 
          success: false, 
          message: `No user found with email: ${formData.employerEmail}. Please ensure the company user is registered in the system first.` 
        };
      }
    }

    // Check if booth number already exists for this event
    const existingBooth = await db
      .select()
      .from(booths)
      .where(and(
        eq(booths.eventId, formData.eventId),
        eq(booths.boothNumber, formData.boothNumber)
      ))
      .limit(1);

    if (existingBooth[0]) {
      return { 
        success: false, 
        message: `Booth number ${formData.boothNumber} already exists for this event` 
      };
    }

    // Create new booth
    const boothId = `booth_${Date.now()}_${randomUUID().substring(0, 8)}`;
    
    await db.insert(booths).values({
      id: boothId,
      eventId: formData.eventId,
      employerId: employer[0].employer.id,
      boothNumber: formData.boothNumber,
      location: formData.location,
      size: formData.size,
      equipment: formData.equipment,
      specialRequirements: formData.specialRequirements,
      isActive: true,
    });

    revalidatePath("/admin/booths");
    revalidatePath("/employer/booths");
    
    return { 
      success: true, 
      message: "Booth created successfully",
      boothId
    };
  } catch (error) {
    console.error("Error creating admin booth:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create booth" 
    };
  }
}

export async function updateAdminBooth(boothId: string, formData: {
  eventId?: string;
  employerEmail?: string;
  boothNumber?: string;
  location?: string;
  size?: "small" | "medium" | "large";
  equipment?: string[];
  specialRequirements?: string;
  isActive?: boolean;
}) {
  try {
    await ensureAdminAccess();

    // If employerEmail is provided, find the employer
    let employerId: string | undefined;
    if (formData.employerEmail) {
      const employer = await db
        .select()
        .from(employers)
        .leftJoin(users, eq(users.id, employers.userId))
        .where(eq(users.email, formData.employerEmail))
        .limit(1);

      if (!employer[0]) {
        return { 
          success: false, 
          message: `No employer found with email: ${formData.employerEmail}` 
        };
      }
      employerId = employer[0].employer.id;
    }

    // Update booth
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (formData.eventId) updateData.eventId = formData.eventId;
    if (employerId) updateData.employerId = employerId;
    if (formData.boothNumber) updateData.boothNumber = formData.boothNumber;
    if (formData.location) updateData.location = formData.location;
    if (formData.size) updateData.size = formData.size;
    if (formData.equipment) updateData.equipment = formData.equipment;
    if (formData.specialRequirements !== undefined) updateData.specialRequirements = formData.specialRequirements;
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive;

    await db
      .update(booths)
      .set(updateData)
      .where(eq(booths.id, boothId));

    revalidatePath("/admin/booths");
    revalidatePath("/employer/booths");
    
    return { 
      success: true, 
      message: "Booth updated successfully"
    };
  } catch (error) {
    console.error("Error updating admin booth:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update booth" 
    };
  }
}

export async function deleteAdminBooth(boothId: string) {
  try {
    await ensureAdminAccess();

    await db
      .delete(booths)
      .where(eq(booths.id, boothId));

    revalidatePath("/admin/booths");
    revalidatePath("/employer/booths");
    
    return { 
      success: true, 
      message: "Booth deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting admin booth:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to delete booth" 
    };
  }
}

export async function toggleBoothStatus(boothId: string) {
  try {
    await ensureAdminAccess();

    // Get current booth status
    const currentBooth = await db
      .select()
      .from(booths)
      .where(eq(booths.id, boothId))
      .limit(1);

    if (!currentBooth[0]) {
      return { 
        success: false, 
        message: "Booth not found" 
      };
    }

    // Toggle status
    await db
      .update(booths)
      .set({ 
        isActive: !currentBooth[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(booths.id, boothId));

    revalidatePath("/admin/booths");
    revalidatePath("/employer/booths");
    
    return { 
      success: true, 
      message: `Booth ${currentBooth[0].isActive ? 'deactivated' : 'activated'} successfully`
    };
  } catch (error) {
    console.error("Error toggling booth status:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to toggle booth status" 
    };
  }
}

export async function createUnassignedBooth(formData: {
  eventId: string;
  boothNumber: string;
  location: string;
  size: "small" | "medium" | "large";
  equipment: string[];
  specialRequirements?: string;
}) {
  try {
    await ensureAdminAccess();

    // Check if booth number already exists for this event
    const existingBooth = await db
      .select()
      .from(booths)
      .where(and(
        eq(booths.eventId, formData.eventId),
        eq(booths.boothNumber, formData.boothNumber)
      ))
      .limit(1);

    if (existingBooth[0]) {
      return { 
        success: false, 
        message: `Booth number ${formData.boothNumber} already exists for this event` 
      };
    }

    // Create new unassigned booth with a placeholder employer ID
    const boothId = `booth_${Date.now()}_${randomUUID().substring(0, 8)}`;
    
    await db.insert(booths).values({
      id: boothId,
      eventId: formData.eventId,
      employerId: "unassigned", // Special placeholder for unassigned booths
      boothNumber: formData.boothNumber,
      location: formData.location,
      size: formData.size,
      equipment: formData.equipment,
      specialRequirements: formData.specialRequirements,
      isActive: false, // Inactive until assigned
    });

    revalidatePath("/admin/booths");
    
    return { 
      success: true, 
      message: "Unassigned booth created successfully. You can assign it to a company later.",
      boothId
    };
  } catch (error) {
    console.error("Error creating unassigned booth:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create unassigned booth" 
    };
  }
}

export async function assignBoothToEmployer(boothId: string, employerEmail: string) {
  try {
    await ensureAdminAccess();

    // Find the employer by email
    const employer = await db
      .select({
        employer: employers,
        user: users
      })
      .from(employers)
      .leftJoin(users, eq(users.id, employers.userId))
      .where(eq(users.email, employerEmail))
      .limit(1);

    if (!employer[0]) {
      return { 
        success: false, 
        message: `No employer found with email: ${employerEmail}` 
      };
    }

    // Update booth with employer assignment
    await db
      .update(booths)
      .set({ 
        employerId: employer[0].employer.id,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(booths.id, boothId));

    revalidatePath("/admin/booths");
    revalidatePath("/employer/booths");
    
    return { 
      success: true, 
      message: `Booth successfully assigned to ${employer[0].employer.companyName}`
    };
  } catch (error) {
    console.error("Error assigning booth to employer:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to assign booth to employer" 
    };
  }
} 