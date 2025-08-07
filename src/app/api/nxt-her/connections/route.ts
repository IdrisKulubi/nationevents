import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db/drizzle";
import { 
  nxtHerAttendees, 
  nxtHerConnections, 
  nxtHerConnectionSuggestions 
} from "@/db/nxt-her-schema";
import { eq, and, or, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const connectionRequestSchema = z.object({
  requestedAttendeeId: z.string().min(1),
  message: z.string().optional(),
});

const connectionResponseSchema = z.object({
  connectionId: z.string().min(1),
  action: z.enum(["accept", "decline"]),
});

// GET - Fetch connections for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, sent, received, accepted

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    let whereCondition;
    
    switch (type) {
      case "sent":
        whereCondition = eq(nxtHerConnections.requesterAttendeeId, attendee.id);
        break;
      case "received":
        whereCondition = and(
          eq(nxtHerConnections.requestedAttendeeId, attendee.id),
          eq(nxtHerConnections.status, "pending")
        );
        break;
      case "accepted":
        whereCondition = and(
          or(
            eq(nxtHerConnections.requesterAttendeeId, attendee.id),
            eq(nxtHerConnections.requestedAttendeeId, attendee.id)
          ),
          eq(nxtHerConnections.status, "accepted")
        );
        break;
      default: // all
        whereCondition = or(
          eq(nxtHerConnections.requesterAttendeeId, attendee.id),
          eq(nxtHerConnections.requestedAttendeeId, attendee.id)
        );
    }

    // Fetch connections with attendee details
    const connections = await db
      .select({
        id: nxtHerConnections.id,
        status: nxtHerConnections.status,
        message: nxtHerConnections.message,
        connectedAt: nxtHerConnections.connectedAt,
        createdAt: nxtHerConnections.createdAt,
        isRequester: sql<boolean>`${nxtHerConnections.requesterAttendeeId} = ${attendee.id}`,
        // Requester details
        requesterAttendeeId: nxtHerConnections.requesterAttendeeId,
        requesterFirstName: sql<string>`requester.first_name`,
        requesterLastName: sql<string>`requester.last_name`,
        requesterJobTitle: sql<string>`requester.job_title`,
        requesterOrganization: sql<string>`requester.organization`,
        requesterProfilePhotoUrl: sql<string>`requester.profile_photo_url`,
        // Requested details
        requestedAttendeeId: nxtHerConnections.requestedAttendeeId,
        requestedFirstName: sql<string>`requested.first_name`,
        requestedLastName: sql<string>`requested.last_name`,
        requestedJobTitle: sql<string>`requested.job_title`,
        requestedOrganization: sql<string>`requested.organization`,
        requestedProfilePhotoUrl: sql<string>`requested.profile_photo_url`,
      })
      .from(nxtHerConnections)
      .innerJoin(
        sql`${nxtHerAttendees} AS requester`,
        eq(nxtHerConnections.requesterAttendeeId, sql`requester.id`)
      )
      .innerJoin(
        sql`${nxtHerAttendees} AS requested`,
        eq(nxtHerConnections.requestedAttendeeId, sql`requested.id`)
      )
      .where(whereCondition)
      .orderBy(desc(nxtHerConnections.createdAt));

    const formattedConnections = connections.map(conn => {
      const isRequester = conn.isRequester;
      const otherAttendee = isRequester ? {
        id: conn.requestedAttendeeId,
        firstName: conn.requestedFirstName,
        lastName: conn.requestedLastName,
        jobTitle: conn.requestedJobTitle,
        organization: conn.requestedOrganization,
        profilePhotoUrl: conn.requestedProfilePhotoUrl,
      } : {
        id: conn.requesterAttendeeId,
        firstName: conn.requesterFirstName,
        lastName: conn.requesterLastName,
        jobTitle: conn.requesterJobTitle,
        organization: conn.requesterOrganization,
        profilePhotoUrl: conn.requesterProfilePhotoUrl,
      };

      return {
        id: conn.id,
        status: conn.status,
        message: conn.message,
        connectedAt: conn.connectedAt,
        createdAt: conn.createdAt,
        isRequester,
        otherAttendee,
      };
    });

    return NextResponse.json({
      connections: formattedConnections,
      counts: {
        total: formattedConnections.length,
        pending: formattedConnections.filter(c => c.status === "pending").length,
        accepted: formattedConnections.filter(c => c.status === "accepted").length,
        declined: formattedConnections.filter(c => c.status === "declined").length,
      },
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

// POST - Send a connection request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = connectionRequestSchema.parse(body);

    // Find the requester attendee
    const requesterAttendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!requesterAttendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Verify the requested attendee exists
    const requestedAttendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.id, validatedData.requestedAttendeeId),
    });

    if (!requestedAttendee) {
      return NextResponse.json({ error: "Requested attendee not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existingConnection = await db.query.nxtHerConnections.findFirst({
      where: or(
        and(
          eq(nxtHerConnections.requesterAttendeeId, requesterAttendee.id),
          eq(nxtHerConnections.requestedAttendeeId, validatedData.requestedAttendeeId)
        ),
        and(
          eq(nxtHerConnections.requesterAttendeeId, validatedData.requestedAttendeeId),
          eq(nxtHerConnections.requestedAttendeeId, requesterAttendee.id)
        )
      ),
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection request already exists" },
        { status: 400 }
      );
    }

    // Create the connection request
    const [newConnection] = await db
      .insert(nxtHerConnections)
      .values({
        id: nanoid(),
        requesterAttendeeId: requesterAttendee.id,
        requestedAttendeeId: validatedData.requestedAttendeeId,
        message: validatedData.message,
        status: "pending",
      })
      .returning();

    // Update any related suggestion to "connected" status
    await db
      .update(nxtHerConnectionSuggestions)
      .set({ status: "connected", updatedAt: new Date() })
      .where(
        and(
          eq(nxtHerConnectionSuggestions.fromAttendeeId, requesterAttendee.id),
          eq(nxtHerConnectionSuggestions.toAttendeeId, validatedData.requestedAttendeeId)
        )
      );

    return NextResponse.json({
      message: "Connection request sent successfully",
      connection: {
        id: newConnection.id,
        status: newConnection.status,
        message: newConnection.message,
        createdAt: newConnection.createdAt,
        otherAttendee: {
          id: requestedAttendee.id,
          firstName: requestedAttendee.firstName,
          lastName: requestedAttendee.lastName,
          jobTitle: requestedAttendee.jobTitle,
          organization: requestedAttendee.organization,
          profilePhotoUrl: requestedAttendee.profilePhotoUrl,
        },
      },
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send connection request" },
      { status: 500 }
    );
  }
}

// PUT - Respond to a connection request (accept/decline)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = connectionResponseSchema.parse(body);

    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!attendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Find the connection request
    const connection = await db.query.nxtHerConnections.findFirst({
      where: and(
        eq(nxtHerConnections.id, validatedData.connectionId),
        eq(nxtHerConnections.requestedAttendeeId, attendee.id),
        eq(nxtHerConnections.status, "pending")
      ),
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection request not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the connection status
    const [updatedConnection] = await db
      .update(nxtHerConnections)
      .set({
        status: validatedData.action === "accept" ? "accepted" : "declined",
        connectedAt: validatedData.action === "accept" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(nxtHerConnections.id, validatedData.connectionId))
      .returning();

    return NextResponse.json({
      message: `Connection request ${validatedData.action}ed successfully`,
      connection: updatedConnection,
    });
  } catch (error) {
    console.error("Error responding to connection request:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to respond to connection request" },
      { status: 500 }
    );
  }
}