"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { employers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface EmployerProfileData {
  userId: string;
  companyName: string;
  companyDescription?: string;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  website?: string;
  address?: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone?: string;
}

export async function createEmployerProfile(data: EmployerProfileData) {
  try {
    // Validate required fields
    if (!data.userId || !data.companyName || !data.industry || !data.companySize || !data.contactEmail) {
      return { 
        success: false, 
        message: "Please fill in all required fields" 
      };
    }

    // Validate companySize enum
    const validCompanySizes = ["startup", "small", "medium", "large", "enterprise"];
    if (!validCompanySizes.includes(data.companySize)) {
      return { 
        success: false, 
        message: "Invalid company size specified" 
      };
    }

    // Check if employer profile already exists
    const existingProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, data.userId))
      .limit(1);

    if (existingProfile[0]) {
      console.log("Employer profile already exists, returning success");
      return { 
        success: true, 
        message: `Welcome back, ${existingProfile[0].companyName}! Redirecting to your dashboard...`,
        employerId: existingProfile[0].id,
        shouldUpdateSession: true // Flag to trigger session update
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactEmail)) {
      return { 
        success: false, 
        message: "Please enter a valid email address" 
      };
    }

    // Validate website URL if provided
    if (data.website && data.website.trim()) {
      try {
        new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`);
      } catch {
        return { 
          success: false, 
          message: "Please enter a valid website URL" 
        };
      }
    }

    // Generate employer ID
    const employerId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create employer profile (role should already be set correctly)
    await db.insert(employers).values({
      id: employerId,
      userId: data.userId,
      companyName: data.companyName.trim(),
      companyDescription: data.companyDescription?.trim() || null,
      industry: data.industry,
      companySize: data.companySize,
      website: data.website?.trim() || null,
      address: data.address?.trim() || null,
      contactPerson: data.contactPerson?.trim() || null,
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone?.trim() || null,
      isVerified: false, // Admin can verify later
    });

    // Revalidate cache
    revalidatePath("/employer");
    revalidatePath("/employer/setup");
    revalidatePath("/dashboard");

    return { 
      success: true, 
      message: `Welcome to the platform, ${data.companyName}! Redirecting to your dashboard...`,
      employerId,
      shouldUpdateSession: true, // Flag to trigger session update
      profileCompleted: true // Indicate profile is now complete
    };

  } catch (error) {
    console.error("Error creating employer profile:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return { 
          success: false, 
          message: "A profile with this information already exists" 
        };
      }
    }

    return { 
      success: false, 
      message: "Failed to create employer profile. Please try again." 
    };
  }
}

export async function updateEmployerProfile(employerId: string, data: Partial<EmployerProfileData>) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Verify employer profile belongs to current user
    const employer = await db
      .select()
      .from(employers)
      .where(eq(employers.id, employerId))
      .limit(1);

    if (!employer[0] || employer[0].userId !== session.user.id) {
      return { success: false, message: "Employer profile not found" };
    }

    // Update employer profile
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.companyName) updateData.companyName = data.companyName.trim();
    if (data.companyDescription !== undefined) updateData.companyDescription = data.companyDescription.trim() || null;
    if (data.industry) updateData.industry = data.industry;
    if (data.companySize) updateData.companySize = data.companySize;
    if (data.website !== undefined) updateData.website = data.website.trim() || null;
    if (data.address !== undefined) updateData.address = data.address.trim() || null;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson.trim() || null;
    if (data.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail)) {
        return { success: false, message: "Please provide a valid email address" };
      }
      updateData.contactEmail = data.contactEmail.trim();
    }
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone.trim() || null;

    await db
      .update(employers)
      .set(updateData)
      .where(eq(employers.id, employerId));

    revalidatePath("/employer");
    revalidatePath("/employer/profile");

    return { 
      success: true, 
      message: "Profile updated successfully" 
    };

  } catch (error) {
    console.error("Error updating employer profile:", error);
    return { 
      success: false, 
      message: "Failed to update profile. Please try again." 
    };
  }
}

export async function getEmployerProfile() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const employer = await db
      .select({
        employer: employers,
        user: users,
      })
      .from(employers)
      .leftJoin(users, eq(users.id, employers.userId))
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    return employer[0] || null;

  } catch (error) {
    console.error("Error fetching employer profile:", error);
    return null;
  }
} 