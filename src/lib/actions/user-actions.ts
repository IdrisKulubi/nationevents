"use server";
import db from "@/db/drizzle";
import { users, jobSeekers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateSecurePin, generateTicketNumber } from "@/lib/utils/security";
import { sendWelcomeEmail } from "@/lib/utils/notifications";
import { sendWelcomeSMS as sendTwilioWelcomeSMS } from "@/lib/actions/send-sms-actions";
import { auth } from "@/lib/auth";

interface CreateJobSeekerProfileData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  bio: string;
  jobSectors: string[];
  educationLevel: string;
  experienceLevel: string;
  skills: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: string;
  availableFrom: string;
  cvUrl: string;
  interestCategories: string[];
  additionalDocuments?: Array<{
    id: string;
    name: string;
    url: string;
    uploadKey: string;
    uploadedAt: string;
    fileSize?: number;
    fileType?: string;
  }>;
  // Huawei student fields
  isHuaweiStudent?: boolean;
  huaweiCertificationLevel?: string;
  huaweiCertificationDetails?: string;
  // Conference fields
  wantsToAttendConference?: boolean;
  conferenceSessionInterests?: string[];
  conferenceDietaryRequirements?: string;
  conferenceAccessibilityNeeds?: string;
  // Data privacy fields
  dataPrivacyAccepted: boolean;
  dataPrivacyAcceptedAt: Date;
}

export async function createJobSeekerProfile(data: CreateJobSeekerProfileData) {
  try {
    // Debug: Log the incoming data to see what we're receiving
    console.log("🔍 CreateJobSeekerProfile received data:", {
      userId: data.userId,
      fullName: data.fullName,
      skills: data.skills,
      expectedSalary: data.expectedSalary,
      skillsType: typeof data.skills,
      expectedSalaryType: typeof data.expectedSalary,
    });

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, data.userId))
      .limit(1);

    if (existingProfile.length > 0) {
      console.log("Profile already exists, updating instead of creating new one");
      
      // Update existing profile instead of throwing error
      const existingJobSeeker = existingProfile[0];
      
      // If profile already has CV, just return success
      if (existingJobSeeker.cvUrl) {
        console.log("Profile already complete with CV, returning success");
        return {
          success: true,
          message: "Profile already complete",
          data: {
            pin: existingJobSeeker.pin,
            ticketNumber: existingJobSeeker.ticketNumber,
          }
        };
      }
      
      // Update incomplete profile
      await updateUserProfile(data.userId, data);
      return {
        success: true,
        message: "Profile updated successfully",
        data: {
          pin: existingJobSeeker.pin,
          ticketNumber: existingJobSeeker.ticketNumber,
        }
      };
    }

    // Generate PIN and ticket number
    const pin = generateSecurePin();
    const ticketNumber = generateTicketNumber();
    const pinExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Start transaction
    await db.transaction(async (tx: any) => {
      // Update user table with basic info
      await tx
        .update(users)
        .set({
          name: data.fullName,
          phoneNumber: data.phoneNumber,
          role: "job_seeker",
          updatedAt: new Date(),
        })
        .where(eq(users.id, data.userId));

      // Validate and process expectedSalary
      let processedExpectedSalary = null;
      if (data.expectedSalary && data.expectedSalary.trim()) {
        // Try to extract numeric value from salary string
        const salaryMatch = data.expectedSalary.replace(/[^\d.-]/g, '');
        if (salaryMatch && !isNaN(parseFloat(salaryMatch))) {
          processedExpectedSalary = salaryMatch;
        }
      }

      // Create job seeker profile
      await tx
        .insert(jobSeekers)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          bio: data.bio,
          cvUrl: data.cvUrl,
          additionalDocuments: data.additionalDocuments || [],
          skills: data.skills,
          experience: data.experienceLevel,
          education: data.educationLevel,
          pin: pin,
          ticketNumber: ticketNumber,
          registrationStatus: "pending",
          interestCategories: data.interestCategories,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          expectedSalary: processedExpectedSalary,
          availableFrom: new Date(data.availableFrom),
          pinGeneratedAt: new Date(),
          pinExpiresAt: pinExpirationTime,
          // Huawei student fields
          isHuaweiStudent: data.isHuaweiStudent || false,
          huaweiStudentId: null, // No longer collecting student ID
          huaweiCertificationLevel: data.huaweiCertificationLevel || null,
          huaweiCertificationDetails: data.huaweiCertificationDetails ? 
            [{ details: data.huaweiCertificationDetails, addedAt: new Date().toISOString() }] : null,
          // Conference fields
          wantsToAttendConference: data.wantsToAttendConference || false,
          conferenceRegistrationDate: data.wantsToAttendConference ? new Date() : null,
          conferenceAttendanceStatus: data.wantsToAttendConference ? "registered" : null,
          conferencePreferences: data.wantsToAttendConference ? {
            sessionInterests: data.conferenceSessionInterests || [],
            dietaryRequirements: data.conferenceDietaryRequirements || "",
            accessibilityNeeds: data.conferenceAccessibilityNeeds || ""
          } : null,
          // Data privacy fields
          dataPrivacyAccepted: data.dataPrivacyAccepted,
          dataPrivacyAcceptedAt: data.dataPrivacyAcceptedAt,
          dataRetentionPeriod: "1_year",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    });

    // Send notifications
    const user = await getUserById(data.userId);
    if (user) {
      // Send welcome email with PIN
      await sendWelcomeEmail({
        email: user.email,
        name: data.fullName,
        pin: pin,
        ticketNumber: ticketNumber,
        eventDetails: {
          name: "Huawei Career Summit",
          date: "July 8th, 2025",
          venue: "UON Graduation Square, Nairobi",
        }
      });

      // Send welcome SMS with PIN using Twilio
      const jobSeekerProfile = await db
        .select()
        .from(jobSeekers)
        .where(eq(jobSeekers.userId, data.userId))
        .limit(1);

      if (jobSeekerProfile.length > 0 && user.phoneNumber) {
        try {
          console.log(`📱 Sending welcome SMS to job seeker: ${jobSeekerProfile[0].id}`);
          const smsResult = await sendTwilioWelcomeSMS(jobSeekerProfile[0].id);
          
          if (smsResult.success) {
            console.log(`✅ Welcome SMS sent successfully: ${smsResult.messageId}`);
          } else {
            console.error("❌ Failed to send welcome SMS:", smsResult.error);
            // Continue without failing the registration
          }
        } catch (error: any) {
          console.error("❌ Error sending welcome SMS:", error);
          // Continue without failing the registration
        }
      } else {
        console.warn("⚠️ Cannot send SMS: Job seeker profile not found or phone number missing");
      }
    }

    return {
      success: true,
      message: "Profile created successfully",
      data: {
        pin,
        ticketNumber,
      }
    };

  } catch (error) {
    console.error("Error creating job seeker profile:", error);
    console.log(error);
    throw new Error("Failed to create profile. Please try again.");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const result = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(users)
      .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { user, jobSeeker } = result[0];
    
    // More robust profile completion check
    const profileComplete = !!(jobSeeker?.id && jobSeeker?.cvUrl);
    
    return {
      ...user,
      jobSeeker,
      profileComplete,
    };

  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // Log additional context for debugging
    console.error("getUserProfile error context:", {
      userId,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    
    // Return null to let calling code handle the error appropriately
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<CreateJobSeekerProfileData>) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    await db.transaction(async (tx: any) => {
      // Update user table if name or phone changed
      if (updates.fullName || updates.phoneNumber) {
        await tx
          .update(users)
          .set({
            ...(updates.fullName && { name: updates.fullName }),
            ...(updates.phoneNumber && { phoneNumber: updates.phoneNumber }),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      // Update job seeker profile
      const jobSeekerUpdates: any = {};
      
      if (updates.bio) jobSeekerUpdates.bio = updates.bio;
      if (updates.cvUrl) jobSeekerUpdates.cvUrl = updates.cvUrl;
      if (updates.additionalDocuments !== undefined) jobSeekerUpdates.additionalDocuments = updates.additionalDocuments;
      if (updates.skills) jobSeekerUpdates.skills = updates.skills;
      if (updates.experienceLevel) jobSeekerUpdates.experience = updates.experienceLevel;
      if (updates.educationLevel) jobSeekerUpdates.education = updates.educationLevel;
      if (updates.interestCategories) jobSeekerUpdates.interestCategories = updates.interestCategories;
      if (updates.linkedinUrl !== undefined) jobSeekerUpdates.linkedinUrl = updates.linkedinUrl || null;
      if (updates.portfolioUrl !== undefined) jobSeekerUpdates.portfolioUrl = updates.portfolioUrl || null;
      if (updates.expectedSalary !== undefined) {
        let processedExpectedSalary = null;
        if (updates.expectedSalary && updates.expectedSalary.trim()) {
          // Try to extract numeric value from salary string
          const salaryMatch = updates.expectedSalary.replace(/[^\d.-]/g, '');
          if (salaryMatch && !isNaN(parseFloat(salaryMatch))) {
            processedExpectedSalary = salaryMatch;
          }
        }
        jobSeekerUpdates.expectedSalary = processedExpectedSalary;
      }
      if (updates.availableFrom) jobSeekerUpdates.availableFrom = new Date(updates.availableFrom);

      if (Object.keys(jobSeekerUpdates).length > 0) {
        jobSeekerUpdates.updatedAt = new Date();
        
        await tx
          .update(jobSeekers)
          .set(jobSeekerUpdates)
          .where(eq(jobSeekers.userId, userId));
      }
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };

  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
}

export async function regeneratePin(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const newPin = generateSecurePin();
    const pinExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await db
      .update(jobSeekers)
      .set({
        pin: newPin,
        pinGeneratedAt: new Date(),
        pinExpiresAt: pinExpirationTime,
        updatedAt: new Date(),
      })
      .where(eq(jobSeekers.userId, userId));

    // Get user details for notifications
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      // Send new PIN via email
      await sendWelcomeEmail({
        email: userProfile.email,
        name: userProfile.name || "Job Seeker",
        pin: newPin,
        ticketNumber: userProfile.jobSeeker?.ticketNumber || "",
        eventDetails: {
          name: "Huawei Career Summit",
          date: "July 8th, 2025",
          venue: "UON Graduation Square, Nairobi",
        }
      });

      // Send new PIN via SMS using Twilio
      if (userProfile.phoneNumber && userProfile.jobSeeker?.id) {
        try {
          console.log(`📱 Sending PIN reminder SMS to job seeker: ${userProfile.jobSeeker.id}`);
          
          // Use PIN reminder SMS function instead
          const { sendPinReminderSMS } = await import("@/lib/actions/send-sms-actions");
          const smsResult = await sendPinReminderSMS(userProfile.jobSeeker.id);
          
          if (smsResult.success) {
            console.log(`✅ PIN reminder SMS sent successfully: ${smsResult.messageId}`);
          } else {
            console.error("❌ Failed to send PIN reminder SMS:", smsResult.error);
          }
        } catch (error: any) {
          console.error("❌ Error sending PIN reminder SMS:", error);
        }
      }
    }

    return {
      success: true,
      message: "New PIN generated and sent successfully",
      pin: newPin,
    };

  } catch (error) {
    console.error("Error regenerating PIN:", error);
    throw new Error("Failed to regenerate PIN. Please try again.");
  }
}

export async function verifyPin(ticketNumber: string, pin: string) {
  try {
    const result = await db
      .select({
        jobSeeker: jobSeekers,
        user: users,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(
        and(
          eq(jobSeekers.ticketNumber, ticketNumber),
          eq(jobSeekers.pin, pin)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        message: "Invalid ticket number or PIN",
      };
    }

    const { jobSeeker, user } = result[0];

    // Check if PIN has expired
    if (jobSeeker.pinExpiresAt && new Date() > jobSeeker.pinExpiresAt) {
      return {
        success: false,
        message: "PIN has expired. Please request a new one.",
        expired: true,
      };
    }

    // Update registration status to approved
    await db
      .update(jobSeekers)
      .set({
        registrationStatus: "approved",
        updatedAt: new Date(),
      })
      .where(eq(jobSeekers.id, jobSeeker.id));

    return {
      success: true,
      message: "PIN verified successfully",
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        ticketNumber: jobSeeker.ticketNumber,
      },
    };

  } catch (error) {
    console.error("Error verifying PIN:", error);
    return {
      success: false,
      message: "An error occurred during verification. Please try again.",
    };
  }
}
