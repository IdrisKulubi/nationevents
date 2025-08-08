import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { nxtHerSessionFeedback, nxtHerAttendees, nxtHerSessions } from "@/db/nxt-her-schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const sessionFeedbackSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  contentQuality: z.number().min(1).max(5, "Content quality rating must be between 1 and 5").optional(),
  speakerRating: z.number().min(1).max(5, "Speaker rating must be between 1 and 5").optional(),
  relevance: z.number().min(1).max(5, "Relevance rating must be between 1 and 5").optional(),
  comments: z.string().max(1000, "Comments must be less than 1000 characters").optional(),
  wouldRecommend: z.boolean().optional(),
});

// GET - Fetch feedback for a session by the current user
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
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
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
    const existingFeedback = await db.query.nxtHerSessionFeedback.findFirst({
      where: and(
        eq(nxtHerSessionFeedback.sessionId, sessionId),
        eq(nxtHerSessionFeedback.attendeeId, attendee.id)
      ),
    });

    return NextResponse.json({
      feedback: existingFeedback || null,
      hasSubmitted: !!existingFeedback,
    });
  } catch (error) {
    console.error("Error fetching session feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Submit session feedback
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
    const validatedData = sessionFeedbackSchema.parse(body);

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email!),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Verify the session exists
    const sessionExists = await db.query.nxtHerSessions.findFirst({
      where: eq(nxtHerSessions.id, validatedData.sessionId),
    });

    if (!sessionExists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if feedback already exists
    const existingFeedback = await db.query.nxtHerSessionFeedback.findFirst({
      where: and(
        eq(nxtHerSessionFeedback.sessionId, validatedData.sessionId),
        eq(nxtHerSessionFeedback.attendeeId, attendee.id)
      ),
    });

    if (existingFeedback) {
      // Update existing feedback
      const [updatedFeedback] = await db
        .update(nxtHerSessionFeedback)
        .set({
          rating: validatedData.rating,
          contentQuality: validatedData.contentQuality,
          speakerRating: validatedData.speakerRating,
          relevance: validatedData.relevance,
          comments: validatedData.comments,
          wouldRecommend: validatedData.wouldRecommend,
        })
        .where(eq(nxtHerSessionFeedback.id, existingFeedback.id))
        .returning();

      return NextResponse.json({
        message: "Feedback updated successfully",
        feedback: updatedFeedback,
      });
    } else {
      // Create new feedback
      const [newFeedback] = await db
        .insert(nxtHerSessionFeedback)
        .values({
          id: nanoid(),
          sessionId: validatedData.sessionId,
          attendeeId: attendee.id,
          rating: validatedData.rating,
          contentQuality: validatedData.contentQuality,
          speakerRating: validatedData.speakerRating,
          relevance: validatedData.relevance,
          comments: validatedData.comments,
          wouldRecommend: validatedData.wouldRecommend,
        })
        .returning();

      return NextResponse.json({
        message: "Feedback submitted successfully",
        feedback: newFeedback,
      });
    }
  } catch (error) {
    console.error("Error submitting session feedback:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}