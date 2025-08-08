import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { nxtHerEventFeedback, nxtHerAttendees, nxtHerEvents } from "@/db/nxt-her-schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const eventFeedbackSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  npsScore: z.number().min(0).max(10, "NPS score must be between 0 and 10"),
  overallRating: z.number().min(1).max(5, "Overall rating must be between 1 and 5"),
  contentQuality: z.number().min(1).max(5, "Content quality rating must be between 1 and 5").optional(),
  networkingExperience: z.number().min(1).max(5, "Networking experience rating must be between 1 and 5").optional(),
  platformUsability: z.number().min(1).max(5, "Platform usability rating must be between 1 and 5").optional(),
  mostValuableAspect: z.string().max(500, "Most valuable aspect must be less than 500 characters").optional(),
  leastValuableAspect: z.string().max(500, "Least valuable aspect must be less than 500 characters").optional(),
  suggestions: z.string().max(1000, "Suggestions must be less than 1000 characters").optional(),
  wouldAttendAgain: z.boolean().optional(),
  wouldRecommend: z.boolean().optional(),
});

// GET - Fetch event feedback for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "nxt_her_attendee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email!),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Check if feedback already exists
    const existingFeedback = await db.query.nxtHerEventFeedback.findFirst({
      where: and(
        eq(nxtHerEventFeedback.eventId, eventId),
        eq(nxtHerEventFeedback.attendeeId, attendee.id)
      ),
    });

    return NextResponse.json({
      feedback: existingFeedback || null,
      hasSubmitted: !!existingFeedback,
    });
  } catch (error) {
    console.error("Error fetching event feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Submit event feedback
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "nxt_her_attendee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = eventFeedbackSchema.parse(body);

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email!),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Verify the event exists
    const eventExists = await db.query.nxtHerEvents.findFirst({
      where: eq(nxtHerEvents.id, validatedData.eventId),
    });

    if (!eventExists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if feedback already exists
    const existingFeedback = await db.query.nxtHerEventFeedback.findFirst({
      where: and(
        eq(nxtHerEventFeedback.eventId, validatedData.eventId),
        eq(nxtHerEventFeedback.attendeeId, attendee.id)
      ),
    });

    if (existingFeedback) {
      // Update existing feedback
      const [updatedFeedback] = await db
        .update(nxtHerEventFeedback)
        .set({
          npsScore: validatedData.npsScore,
          overallRating: validatedData.overallRating,
          contentQuality: validatedData.contentQuality,
          networkingExperience: validatedData.networkingExperience,
          platformUsability: validatedData.platformUsability,
          mostValuableAspect: validatedData.mostValuableAspect,
          leastValuableAspect: validatedData.leastValuableAspect,
          suggestions: validatedData.suggestions,
          wouldAttendAgain: validatedData.wouldAttendAgain,
          wouldRecommend: validatedData.wouldRecommend,
        })
        .where(eq(nxtHerEventFeedback.id, existingFeedback.id))
        .returning();

      return NextResponse.json({
        message: "Event feedback updated successfully",
        feedback: updatedFeedback,
      });
    } else {
      // Create new feedback
      const [newFeedback] = await db
        .insert(nxtHerEventFeedback)
        .values({
          id: nanoid(),
          eventId: validatedData.eventId,
          attendeeId: attendee.id,
          npsScore: validatedData.npsScore,
          overallRating: validatedData.overallRating,
          contentQuality: validatedData.contentQuality,
          networkingExperience: validatedData.networkingExperience,
          platformUsability: validatedData.platformUsability,
          mostValuableAspect: validatedData.mostValuableAspect,
          leastValuableAspect: validatedData.leastValuableAspect,
          suggestions: validatedData.suggestions,
          wouldAttendAgain: validatedData.wouldAttendAgain,
          wouldRecommend: validatedData.wouldRecommend,
        })
        .returning();

      return NextResponse.json({
        message: "Event feedback submitted successfully",
        feedback: newFeedback,
      });
    }
  } catch (error) {
    console.error("Error submitting event feedback:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit event feedback" },
      { status: 500 }
    );
  }
}