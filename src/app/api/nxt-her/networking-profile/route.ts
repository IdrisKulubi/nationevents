import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db/drizzle";
import { nxtHerNetworkingProfiles, nxtHerAttendees } from "@/db/nxt-her-schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const networkingProfileSchema = z.object({
  networkingGoals: z.array(z.string()).min(1),
  sector: z.string().min(1),
  region: z.string().min(1),
  interests: z.array(z.string()).min(1),
  lookingFor: z.array(z.string()).min(1),
  availableFor: z.array(z.string()).min(1),
  preferredConnectionTypes: z.array(z.string()).min(1),
  isVisible: z.boolean(),
});

// GET - Fetch networking profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Find existing networking profile
    const networkingProfile = await db.query.nxtHerNetworkingProfiles.findFirst({
      where: eq(nxtHerNetworkingProfiles.attendeeId, attendee.id),
    });

    if (!networkingProfile) {
      // Return default empty profile structure
      return NextResponse.json({
        networkingGoals: [],
        sector: "",
        region: "",
        interests: [],
        lookingFor: [],
        availableFor: [],
        preferredConnectionTypes: [],
        isVisible: true,
        isNew: true,
      });
    }

    return NextResponse.json({
      networkingGoals: networkingProfile.networkingGoals || [],
      sector: networkingProfile.sector || "",
      region: networkingProfile.region || "",
      interests: networkingProfile.interests || [],
      lookingFor: networkingProfile.lookingFor || [],
      availableFor: networkingProfile.availableFor || [],
      preferredConnectionTypes: networkingProfile.preferredConnectionTypes || [],
      isVisible: networkingProfile.isVisible ?? true,
      isNew: false,
    });
  } catch (error) {
    console.error("Error fetching networking profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch networking profile" },
      { status: 500 }
    );
  }
}

// POST/PUT - Create or update networking profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = networkingProfileSchema.parse(body);

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Check if profile already exists
    const existingProfile = await db.query.nxtHerNetworkingProfiles.findFirst({
      where: eq(nxtHerNetworkingProfiles.attendeeId, attendee.id),
    });

    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(nxtHerNetworkingProfiles)
        .set({
          networkingGoals: validatedData.networkingGoals,
          sector: validatedData.sector,
          region: validatedData.region,
          interests: validatedData.interests,
          lookingFor: validatedData.lookingFor,
          availableFor: validatedData.availableFor,
          preferredConnectionTypes: validatedData.preferredConnectionTypes,
          isVisible: validatedData.isVisible,
          updatedAt: new Date(),
        })
        .where(eq(nxtHerNetworkingProfiles.id, existingProfile.id))
        .returning();

      return NextResponse.json({
        message: "Networking profile updated successfully",
        profile: updatedProfile,
      });
    } else {
      // Create new profile
      const [newProfile] = await db
        .insert(nxtHerNetworkingProfiles)
        .values({
          id: nanoid(),
          attendeeId: attendee.id,
          networkingGoals: validatedData.networkingGoals,
          sector: validatedData.sector,
          region: validatedData.region,
          interests: validatedData.interests,
          lookingFor: validatedData.lookingFor,
          availableFor: validatedData.availableFor,
          preferredConnectionTypes: validatedData.preferredConnectionTypes,
          isVisible: validatedData.isVisible,
        })
        .returning();

      return NextResponse.json({
        message: "Networking profile created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    console.error("Error saving networking profile:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save networking profile" },
      { status: 500 }
    );
  }
}

// DELETE - Delete networking profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Delete the networking profile
    await db
      .delete(nxtHerNetworkingProfiles)
      .where(eq(nxtHerNetworkingProfiles.attendeeId, attendee.id));

    return NextResponse.json({
      message: "Networking profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting networking profile:", error);
    return NextResponse.json(
      { error: "Failed to delete networking profile" },
      { status: 500 }
    );
  }
}