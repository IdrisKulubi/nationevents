import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db/drizzle";
import { nxtHerAttendees, nxtHerConnectionSuggestions } from "@/db/nxt-her-schema";
import { eq, and, desc } from "drizzle-orm";
import { NetworkingMatcher } from "@/lib/services/networking-matcher";

// GET - Fetch connection suggestions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get("regenerate") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    const matcher = new NetworkingMatcher();

    if (regenerate) {
      // Generate new suggestions
      const suggestions = await matcher.generateAndSaveConnectionSuggestions(
        attendee.id,
        limit,
        0.15 // Minimum score threshold
      );

      return NextResponse.json({
        suggestions: suggestions.map(s => ({
          id: s.id,
          attendee: {
            id: s.attendee.id,
            firstName: s.attendee.firstName,
            lastName: s.attendee.lastName,
            jobTitle: s.attendee.jobTitle,
            organization: s.attendee.organization,
            profilePhotoUrl: s.attendee.profilePhotoUrl,
          },
          matchScore: s.matchScore,
          matchReasons: s.matchReasons,
          status: s.status,
        })),
        regenerated: true,
      });
    } else {
      // Fetch existing suggestions from database
      const existingSuggestions = await db
        .select({
          id: nxtHerConnectionSuggestions.id,
          matchScore: nxtHerConnectionSuggestions.matchScore,
          matchReasons: nxtHerConnectionSuggestions.matchReasons,
          status: nxtHerConnectionSuggestions.status,
          createdAt: nxtHerConnectionSuggestions.createdAt,
          // Attendee details
          attendeeId: nxtHerAttendees.id,
          firstName: nxtHerAttendees.firstName,
          lastName: nxtHerAttendees.lastName,
          jobTitle: nxtHerAttendees.jobTitle,
          organization: nxtHerAttendees.organization,
          profilePhotoUrl: nxtHerAttendees.profilePhotoUrl,
        })
        .from(nxtHerConnectionSuggestions)
        .innerJoin(
          nxtHerAttendees,
          eq(nxtHerConnectionSuggestions.toAttendeeId, nxtHerAttendees.id)
        )
        .where(
          and(
            eq(nxtHerConnectionSuggestions.fromAttendeeId, attendee.id),
            eq(nxtHerConnectionSuggestions.status, "suggested")
          )
        )
        .orderBy(desc(nxtHerConnectionSuggestions.matchScore))
        .limit(limit);

      if (existingSuggestions.length === 0) {
        // No existing suggestions, generate new ones
        const suggestions = await matcher.generateAndSaveConnectionSuggestions(
          attendee.id,
          limit,
          0.15
        );

        return NextResponse.json({
          suggestions: suggestions.map(s => ({
            id: s.id,
            attendee: {
              id: s.attendee.id,
              firstName: s.attendee.firstName,
              lastName: s.attendee.lastName,
              jobTitle: s.attendee.jobTitle,
              organization: s.attendee.organization,
              profilePhotoUrl: s.attendee.profilePhotoUrl,
            },
            matchScore: s.matchScore,
            matchReasons: s.matchReasons,
            status: s.status,
          })),
          regenerated: true,
        });
      }

      return NextResponse.json({
        suggestions: existingSuggestions.map(s => ({
          id: s.id,
          attendee: {
            id: s.attendeeId,
            firstName: s.firstName,
            lastName: s.lastName,
            jobTitle: s.jobTitle,
            organization: s.organization,
            profilePhotoUrl: s.profilePhotoUrl,
          },
          matchScore: parseFloat(s.matchScore || "0"),
          matchReasons: s.matchReasons || [],
          status: s.status,
        })),
        regenerated: false,
      });
    }
  } catch (error) {
    console.error("Error fetching connection suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection suggestions" },
      { status: 500 }
    );
  }
}

// POST - Update suggestion status (viewed, dismissed, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { suggestionId, status } = body;

    if (!suggestionId || !status) {
      return NextResponse.json(
        { error: "Suggestion ID and status are required" },
        { status: 400 }
      );
    }

    if (!["viewed", "dismissed", "connected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Update the suggestion status
    const [updatedSuggestion] = await db
      .update(nxtHerConnectionSuggestions)
      .set({
        status: status as "suggested" | "viewed" | "connected" | "dismissed",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(nxtHerConnectionSuggestions.id, suggestionId),
          eq(nxtHerConnectionSuggestions.fromAttendeeId, attendee.id)
        )
      )
      .returning();

    if (!updatedSuggestion) {
      return NextResponse.json(
        { error: "Suggestion not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Suggestion status updated successfully",
      suggestion: updatedSuggestion,
    });
  } catch (error) {
    console.error("Error updating suggestion status:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion status" },
      { status: 500 }
    );
  }
}