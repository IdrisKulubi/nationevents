"use server";
import db from "@/db/drizzle";
import { nxtHerAttendees, nxtHerEvents } from "@/db/nxt-her-schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { nanoid } from "nanoid";

interface CreateNxtHerAttendeeProfileData {
  attendeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl?: string;
  country: string;
  city: string;
  attendanceType: "in_person" | "virtual";
  // Professional Details
  organization?: string;
  jobTitle?: string;
  aboutYou?: string;
  linkedinProfile?: string;
  twitterHandle?: string;
  website?: string;
  topicsOfInterest?: string[];
  areasOfExpertise?: string[];
  // Consent and Terms
  termsAccepted: boolean;
  infoSharingConsent: boolean;
  termsAcceptedAt: Date;
}

export async function createNxtHerAttendeeProfile(
  data: CreateNxtHerAttendeeProfileData
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await db.transaction(async (tx) => {
      const existingProfile = await tx
        .select({ id: nxtHerAttendees.id })
        .from(nxtHerAttendees)
        .where(eq(nxtHerAttendees.email, data.email))
        .limit(1);

      if (existingProfile.length > 0) {
        throw new Error("Profile already exists for this email");
      }

      // Get or create the Nxt Her Summit event
      let event = await tx.query.nxtHerEvents.findFirst({
        where: eq(nxtHerEvents.name, "Nxt Her Summit"),
      });

      if (!event) {
        const eventId = nanoid();
        await tx.insert(nxtHerEvents).values({
          id: eventId,
          name: "Nxt Her Summit",
          description:
            "An empowering experience of connection, learning, and growth",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-06-03"),
          venue: "TBD",
          isActive: true,
        });

        event = await tx.query.nxtHerEvents.findFirst({
          where: eq(nxtHerEvents.id, eventId),
        });
      }

      if (!event) {
        throw new Error("Failed to create or find event");
      }

      await tx.insert(nxtHerAttendees).values({
        id: data.attendeeId,
        eventId: event.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        profilePhotoUrl: data.profilePhotoUrl,
        country: data.country,
        city: data.city,
        attendanceType: data.attendanceType,
        organization: data.organization,
        jobTitle: data.jobTitle,
        aboutYou: data.aboutYou,
        linkedinProfile: data.linkedinProfile,
        twitterHandle: data.twitterHandle,
        website: data.website,
        topicsOfInterest: data.topicsOfInterest,
        areasOfExpertise: data.areasOfExpertise,
        termsAccepted: data.termsAccepted,
        infoSharingConsent: data.infoSharingConsent,
        termsAcceptedAt: data.termsAcceptedAt,
        registrationStatus: "approved",
        registrationCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return {
      success: true,
      message: "Profile created successfully",
      shouldUpdateSession: true,
    };
  } catch (error) {
    console.error("Error creating Nxt Her attendee profile:", error);
    if (
      error instanceof Error &&
      error.message.includes("Profile already exists")
    ) {
      return { success: false, message: error.message };
    }
    throw new Error("Failed to create profile. Please try again.");
  }
}

export async function getNxtHerAttendeeProfile(email: string) {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, email),
      with: {
        event: true,
      },
    });

    if (!attendee) {
      return null;
    }

    // Profile is complete if they have filled required fields
    const profileComplete = !!(
      attendee.phoneNumber &&
      attendee.country &&
      attendee.city
    );

    return {
      ...attendee,
      profileComplete,
    };
  } catch (error) {
    console.error("Error fetching Nxt Her attendee profile:", error);

    console.error("getNxtHerAttendeeProfile error context:", {
      email,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}

export async function getNxtHerAttendeeById(attendeeId: string) {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.id, attendeeId),
      with: {
        event: true,
      },
    });

    return attendee || null;
  } catch (error) {
    console.error("Error fetching Nxt Her attendee by ID:", error);
    return null;
  }
}

export async function updateNxtHerAttendeeProfile(
  attendeeId: string,
  updates: Partial<CreateNxtHerAttendeeProfileData>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const attendeeUpdates: any = {};

    if (updates.firstName) attendeeUpdates.firstName = updates.firstName;
    if (updates.lastName) attendeeUpdates.lastName = updates.lastName;
    if (updates.phoneNumber) attendeeUpdates.phoneNumber = updates.phoneNumber;
    if (updates.profilePhotoUrl !== undefined)
      attendeeUpdates.profilePhotoUrl = updates.profilePhotoUrl;
    if (updates.country) attendeeUpdates.country = updates.country;
    if (updates.city) attendeeUpdates.city = updates.city;
    if (updates.attendanceType)
      attendeeUpdates.attendanceType = updates.attendanceType;
    if (updates.organization !== undefined)
      attendeeUpdates.organization = updates.organization;
    if (updates.jobTitle !== undefined)
      attendeeUpdates.jobTitle = updates.jobTitle;
    if (updates.aboutYou !== undefined)
      attendeeUpdates.aboutYou = updates.aboutYou;
    if (updates.linkedinProfile !== undefined)
      attendeeUpdates.linkedinProfile = updates.linkedinProfile;
    if (updates.twitterHandle !== undefined)
      attendeeUpdates.twitterHandle = updates.twitterHandle;
    if (updates.website !== undefined)
      attendeeUpdates.website = updates.website;
    if (updates.topicsOfInterest !== undefined)
      attendeeUpdates.topicsOfInterest = updates.topicsOfInterest;
    if (updates.areasOfExpertise !== undefined)
      attendeeUpdates.areasOfExpertise = updates.areasOfExpertise;
    if (updates.infoSharingConsent !== undefined)
      attendeeUpdates.infoSharingConsent = updates.infoSharingConsent;

    if (Object.keys(attendeeUpdates).length > 0) {
      attendeeUpdates.updatedAt = new Date();

      await db
        .update(nxtHerAttendees)
        .set(attendeeUpdates)
        .where(eq(nxtHerAttendees.id, attendeeId));
    }

    return {
      success: true,
      message: "Profile updated successfully",
      shouldUpdateSession: true,
    };
  } catch (error) {
    console.error("Error updating Nxt Her attendee profile:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
}

export async function getAllNxtHerAttendees() {
  try {
    const attendees = await db.query.nxtHerAttendees.findMany({
      with: {
        event: true,
      },
      orderBy: (attendees, { desc }) => [desc(attendees.createdAt)],
    });

    return attendees;
  } catch (error) {
    console.error("Error fetching all Nxt Her attendees:", error);
    return [];
  }
}

export async function updateAttendeeRegistrationStatus(
  attendeeId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await db
      .update(nxtHerAttendees)
      .set({
        registrationStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(nxtHerAttendees.id, attendeeId));

    return {
      success: true,
      message: `Registration status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating registration status:", error);
    throw new Error("Failed to update registration status. Please try again.");
  }
}
