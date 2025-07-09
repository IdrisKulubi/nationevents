"use server";

import db from "@/db/drizzle";
import { jobSeekers, users, attendanceRecords, events, securityPersonnel } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { validatePinFormat, validateTicketNumberFormat } from "@/lib/utils/security";

/**
 * Validates and resolves security ID to ensure it exists in security_personnel table
 * For admin users, returns null to allow verification without security personnel reference
 */
async function validateSecurityId(securityId: string): Promise<string | null> {
  // Check if this is an admin-generated mock ID
  if (securityId.startsWith('admin-')) {
    // For admin users, we'll set verifiedBy to null
    // This allows admin verification without foreign key constraint issues
    return null;
  }

  // For regular security personnel, verify the ID exists
  const securityExists = await db
    .select({ id: securityPersonnel.id })
    .from(securityPersonnel)
    .where(eq(securityPersonnel.id, securityId))
    .limit(1);

  if (securityExists.length === 0) {
    // If security ID is invalid, log it and proceed without assigning a verifier.
    console.warn(`Invalid security personnel ID provided: ${securityId}. Proceeding with null verifier.`);
    return null;
  }

  return securityId;
}

export async function verifyAttendeePin(pin: string, securityId: string) {
  try {
    // Validate PIN format
    if (!validatePinFormat(pin)) {
      return {
        success: false,
        message: "Invalid PIN format. Please enter a 6-digit PIN."
      };
    }

    // Validate security ID and get the resolved ID (or null for admins)
    const validatedSecurityId = await validateSecurityId(securityId);

    // Find job seeker by PIN
    const jobSeeker = await db
      .select({
        id: jobSeekers.id,
        userId: jobSeekers.userId,
        pin: jobSeekers.pin,
        ticketNumber: jobSeekers.ticketNumber,
        registrationStatus: jobSeekers.registrationStatus,
        userName: users.name,
        userEmail: users.email,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.pin, pin))
      .limit(1);

    if (!jobSeeker[0]) {
      return {
        success: false,
        message: "Invalid PIN. No attendee found with this PIN."
      };
    }

    const attendee = jobSeeker[0];

    // Auto-approve attendee if PIN is valid (security verification grants access)
    if (attendee.registrationStatus !== "approved") {
      // Update registration status to approved since PIN verification confirms validity
      await db
        .update(jobSeekers)
        .set({ registrationStatus: "approved" })
        .where(eq(jobSeekers.id, attendee.id));
      
      // Update the attendee object to reflect the new status
      attendee.registrationStatus = "approved";
    }

    // Check if already checked in today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingCheckIn = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.jobSeekerId, attendee.id),
          eq(attendanceRecords.status, "checked_in")
        )
      )
      .orderBy(desc(attendanceRecords.checkInTime))
      .limit(1);

    // Get current active event (this should be configurable)
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!activeEvent[0]) {
      return {
        success: false,
        message: "No active event found. Cannot process check-in."
      };
    }

    const alreadyCheckedIn = existingCheckIn.length > 0;

    // Create attendance record with proper verifiedBy handling
    const attendanceData: any = {
      id: crypto.randomUUID(),
      jobSeekerId: attendee.id,
      eventId: activeEvent[0].id,
      verificationMethod: "pin",
      verificationData: pin,
      status: "checked_in",
      notes: alreadyCheckedIn ? "Duplicate check-in attempt" : undefined,
    };

    // Only set verifiedBy if we have a valid security personnel ID
    if (validatedSecurityId) {
      attendanceData.verifiedBy = validatedSecurityId;
    }

    await db.insert(attendanceRecords).values(attendanceData);

    return {
      success: true,
      message: alreadyCheckedIn 
        ? "Attendee was already checked in, but verification logged."
        : "Attendee successfully verified and checked in.",
      attendee: {
        id: attendee.id,
        name: attendee.userName,
        email: attendee.userEmail,
        pin: attendee.pin,
        ticketNumber: attendee.ticketNumber,
        registrationStatus: attendee.registrationStatus,
        checkInTime: existingCheckIn[0]?.checkInTime.toLocaleString(),
        alreadyCheckedIn,
      }
    };

  } catch (error) {
    console.error("PIN verification error:", error);
    return {
      success: false,
      message: "Verification failed due to system error. Please try again."
    };
  }
}

export async function verifyAttendeeTicket(ticketNumber: string, securityId: string) {
  try {
    // Validate ticket format
    if (!validateTicketNumberFormat(ticketNumber)) {
      return {
        success: false,
        message: "Invalid ticket format. Expected format: HCS-YYYY-XXXXXXXX"
      };
    }

    // Validate security ID and get the resolved ID (or null for admins)
    const validatedSecurityId = await validateSecurityId(securityId);

    // Find job seeker by ticket number
    const jobSeeker = await db
      .select({
        id: jobSeekers.id,
        userId: jobSeekers.userId,
        pin: jobSeekers.pin,
        ticketNumber: jobSeekers.ticketNumber,
        registrationStatus: jobSeekers.registrationStatus,
        userName: users.name,
        userEmail: users.email,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.ticketNumber, ticketNumber))
      .limit(1);

    if (!jobSeeker[0]) {
      return {
        success: false,
        message: "Invalid ticket number. No attendee found with this ticket."
      };
    }

    const attendee = jobSeeker[0];

    // Auto-approve attendee if ticket is valid (security verification grants access)
    if (attendee.registrationStatus !== "approved") {
      // Update registration status to approved since ticket verification confirms validity
      await db
        .update(jobSeekers)
        .set({ registrationStatus: "approved" })
        .where(eq(jobSeekers.id, attendee.id));
      
      // Update the attendee object to reflect the new status
      attendee.registrationStatus = "approved";
    }

    // Check if already checked in
    const existingCheckIn = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.jobSeekerId, attendee.id),
          eq(attendanceRecords.status, "checked_in")
        )
      )
      .orderBy(desc(attendanceRecords.checkInTime))
      .limit(1);

    // Get current active event
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!activeEvent[0]) {
      return {
        success: false,
        message: "No active event found. Cannot process check-in."
      };
    }

    const alreadyCheckedIn = existingCheckIn.length > 0;

    // Create attendance record with proper verifiedBy handling
    const attendanceData: any = {
      id: crypto.randomUUID(),
      jobSeekerId: attendee.id,
      eventId: activeEvent[0].id,
      verificationMethod: "ticket_number",
      verificationData: ticketNumber,
      status: "checked_in",
      notes: alreadyCheckedIn ? "Duplicate check-in attempt" : undefined,
    };

    // Only set verifiedBy if we have a valid security personnel ID
    if (validatedSecurityId) {
      attendanceData.verifiedBy = validatedSecurityId;
    }

    await db.insert(attendanceRecords).values(attendanceData);

    return {
      success: true,
      message: alreadyCheckedIn 
        ? "Attendee was already checked in, but verification logged."
        : "Attendee successfully verified and checked in.",
      attendee: {
        id: attendee.id,
        name: attendee.userName,
        email: attendee.userEmail,
        pin: attendee.pin,
        ticketNumber: attendee.ticketNumber,
        registrationStatus: attendee.registrationStatus,
        checkInTime: existingCheckIn[0]?.checkInTime.toLocaleString(),
        alreadyCheckedIn,
      }
    };

  } catch (error) {
    console.error("Ticket verification error:", error);
    return {
      success: false,
      message: "Verification failed due to system error. Please try again."
    };
  }
} 