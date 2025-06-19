"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { shortlists, employers, jobSeekers, users, candidateInteractions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendShortlistedSMS } from "@/lib/actions/send-sms-actions";

export async function addToShortlist(formData: {
  jobSeekerId: string;
  jobId?: string;
  eventId?: string;
  listName?: string;
  priority?: "high" | "medium" | "low";
  notes?: string;
  tags?: string[];
  sendNotification?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    const employer = employerProfile[0];

    // Check if already shortlisted
    const existingShortlist = await db
      .select()
      .from(shortlists)
      .where(
        and(
          eq(shortlists.employerId, employer.id),
          eq(shortlists.jobSeekerId, formData.jobSeekerId),
          formData.jobId ? eq(shortlists.jobId, formData.jobId) : undefined
        )
      )
      .limit(1);

    if (existingShortlist[0]) {
      return { success: false, message: "Candidate already in shortlist" };
    }

    const shortlistId = `shortlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(shortlists).values({
      id: shortlistId,
      employerId: employer.id,
      jobId: formData.jobId || null,
      eventId: formData.eventId || null,
      jobSeekerId: formData.jobSeekerId,
      listName: formData.listName || "Main Shortlist",
      status: "interested",
      priority: formData.priority || "medium",
      notes: formData.notes,
      tags: formData.tags || [],
      addedBy: session.user.id,
    });

    // Log the interaction
    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(candidateInteractions).values({
      id: interactionId,
      employerId: employer.id,
      jobSeekerId: formData.jobSeekerId,
      eventId: formData.eventId || null,
      interactionType: "shortlisted",
      notes: formData.notes,
      performedBy: session.user.id,
    });

    // Send SMS notification if requested (default: true)
    if (formData.sendNotification !== false) {
      try {
        const smsResult = await sendShortlistedSMS(
          formData.jobSeekerId,
          employer.companyName
        );
        
        if (!smsResult.success) {
          console.warn("Failed to send shortlist SMS notification:", smsResult.error);
          // Don't fail the shortlist operation if SMS fails
        } else {
          console.log(`📱 Shortlist SMS notification sent successfully: ${smsResult.messageId}`);
        }
      } catch (error: any) {
        console.error("Error sending shortlist SMS:", error);
        // Continue with shortlist creation even if SMS fails
      }
    }

    revalidatePath("/employer/shortlists");
    revalidatePath("/employer/candidates");
    
    return { 
      success: true, 
      message: "Candidate added to shortlist successfully",
      shortlistId
    };
  } catch (error) {
    console.error("Error adding to shortlist:", error);
    return { success: false, message: "Failed to add candidate to shortlist" };
  }
}

export async function removeFromShortlist(shortlistId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    // Verify shortlist belongs to this employer
    const shortlist = await db
      .select()
      .from(shortlists)
      .where(
        and(
          eq(shortlists.id, shortlistId),
          eq(shortlists.employerId, employerProfile[0].id)
        )
      )
      .limit(1);

    if (!shortlist[0]) {
      return { success: false, message: "Shortlist entry not found" };
    }

    await db.delete(shortlists).where(eq(shortlists.id, shortlistId));

    revalidatePath("/employer/shortlists");
    revalidatePath("/employer/candidates");
    
    return { success: true, message: "Candidate removed from shortlist" };
  } catch (error) {
    console.error("Error removing from shortlist:", error);
    return { success: false, message: "Failed to remove candidate from shortlist" };
  }
}

export async function updateShortlistStatus(
  shortlistId: string, 
  status: "interested" | "maybe" | "not_interested" | "contacted" | "interviewed" | "offered"
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    // Verify shortlist belongs to this employer
    const shortlist = await db
      .select()
      .from(shortlists)
      .where(
        and(
          eq(shortlists.id, shortlistId),
          eq(shortlists.employerId, employerProfile[0].id)
        )
      )
      .limit(1);

    if (!shortlist[0]) {
      return { success: false, message: "Shortlist entry not found" };
    }

    await db
      .update(shortlists)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(shortlists.id, shortlistId));

    revalidatePath("/employer/shortlists");
    
    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating shortlist status:", error);
    return { success: false, message: "Failed to update status" };
  }
}

export async function updateShortlistNotes(shortlistId: string, notes: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    // Verify shortlist belongs to this employer
    const shortlist = await db
      .select()
      .from(shortlists)
      .where(
        and(
          eq(shortlists.id, shortlistId),
          eq(shortlists.employerId, employerProfile[0].id)
        )
      )
      .limit(1);

    if (!shortlist[0]) {
      return { success: false, message: "Shortlist entry not found" };
    }

    await db
      .update(shortlists)
      .set({ 
        notes,
        updatedAt: new Date()
      })
      .where(eq(shortlists.id, shortlistId));

    // Log the interaction
    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(candidateInteractions).values({
      id: interactionId,
      employerId: employerProfile[0].id,
      jobSeekerId: shortlist[0].jobSeekerId,
      eventId: shortlist[0].eventId,
      interactionType: "note_added",
      notes,
      performedBy: session.user.id,
    });

    revalidatePath("/employer/shortlists");
    
    return { success: true, message: "Notes updated successfully" };
  } catch (error) {
    console.error("Error updating shortlist notes:", error);
    return { success: false, message: "Failed to update notes" };
  }
}

export async function getEmployerShortlists(listName?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return [];
    }

    const employer = employerProfile[0];

    // Build where conditions
    const whereConditions = [eq(shortlists.employerId, employer.id)];
    if (listName) {
      whereConditions.push(eq(shortlists.listName, listName));
    }

    const results = await db
      .select({
        shortlist: shortlists,
        jobSeeker: jobSeekers,
        user: users,
      })
      .from(shortlists)
      .leftJoin(jobSeekers, eq(jobSeekers.id, shortlists.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(shortlists.createdAt));
    
    return results;
  } catch (error) {
    console.error("Error fetching shortlists:", error);
    return [];
  }
}

export async function logCandidateInteraction(formData: {
  jobSeekerId: string;
  eventId?: string;
  interactionType: "booth_visit" | "cv_viewed" | "contact_info_accessed" | "interview_scheduled" | "note_added";
  duration?: number;
  notes?: string;
  rating?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(candidateInteractions).values({
      id: interactionId,
      employerId: employerProfile[0].id,
      jobSeekerId: formData.jobSeekerId,
      eventId: formData.eventId || null,
      interactionType: formData.interactionType,
      duration: formData.duration,
      notes: formData.notes,
      rating: formData.rating,
      performedBy: session.user.id,
    });

    revalidatePath("/employer");
    revalidatePath("/employer/candidates");
    
    return { 
      success: true, 
      message: "Interaction logged successfully",
      interactionId
    };
  } catch (error) {
    console.error("Error logging interaction:", error);
    return { success: false, message: "Failed to log interaction" };
  }
} 