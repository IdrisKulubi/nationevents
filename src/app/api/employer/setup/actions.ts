"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { employers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface EmployerProfileData {
  userId: string;
  companyName: string;
  companyDescription: string;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  website: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export async function createEmployerProfile(data: EmployerProfileData) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.id !== data.userId) {
      return { success: false, message: "Authentication required" };
    }

    // Validate required fields
    if (!data.companyName || !data.industry || !data.companySize || !data.contactEmail) {
      return { 
        success: false, 
        message: "Please fill in all required fields" 
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactEmail)) {
      return { 
        success: false, 
        message: "Please provide a valid email address" 
      };
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!user[0]) {
      return { success: false, message: "User not found" };
    }

    // Check if employer profile already exists
    const existingProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, data.userId))
      .limit(1);

    if (existingProfile[0]) {
      return { 
        success: false, 
        message: "Employer profile already exists" 
      };
    }

    // Generate unique employer ID
    const employerId = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start transaction to update user role and create employer profile
    await db.transaction(async (tx) => {
      // Update user role to employer
      await tx
        .update(users)
        .set({ 
          role: "employer",
          updatedAt: new Date()
        })
        .where(eq(users.id, data.userId));

      // Create employer profile
      await tx.insert(employers).values({
        id: employerId,
        userId: data.userId,
        companyName: data.companyName.trim(),
        companyDescription: data.companyDescription.trim() || null,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website.trim() || null,
        address: data.address.trim() || null,
        contactPerson: data.contactPerson.trim() || null,
        contactEmail: data.contactEmail.trim(),
        contactPhone: data.contactPhone.trim() || null,
        isVerified: false, // Admin can verify later
      });
    });

    // Revalidate cache
    revalidatePath("/employer");
    revalidatePath("/employer/setup");

    return { 
      success: true, 
      message: `Welcome to the platform, ${data.companyName}! Redirecting to your dashboard...`,
      employerId
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