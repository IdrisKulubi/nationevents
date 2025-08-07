import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForums } from "@/db/nxt-her-schema";
import { eq } from "drizzle-orm";

// GET /api/nxt-her/forums/[forumId] - Get a specific forum
export async function GET(
  request: NextRequest,
  { params }: { params: { forumId: string } }
) {
  try {
    const forum = await db.query.nxtHerForums.findFirst({
      where: eq(nxtHerForums.id, params.forumId),
    });

    if (!forum) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    if (!forum.isActive) {
      return NextResponse.json(
        { error: "Forum is not active" },
        { status: 403 }
      );
    }

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error fetching forum:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum" },
      { status: 500 }
    );
  }
}

// PUT /api/nxt-her/forums/[forumId] - Update a forum (admin/moderator only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { forumId: string } }
) {
  try {
    const body = await request.json();
    const { title, description, category, isActive, moderatorIds } = body;

    // TODO: Add authentication check for admin/moderator role
    // For now, we'll assume the request is authorized

    const updatedForum = await db
      .update(nxtHerForums)
      .set({
        title,
        description,
        category,
        isActive,
        moderatorIds,
        updatedAt: new Date(),
      })
      .where(eq(nxtHerForums.id, params.forumId))
      .returning();

    if (updatedForum.length === 0) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedForum[0]);
  } catch (error) {
    console.error("Error updating forum:", error);
    return NextResponse.json(
      { error: "Failed to update forum" },
      { status: 500 }
    );
  }
}

// DELETE /api/nxt-her/forums/[forumId] - Delete a forum (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { forumId: string } }
) {
  try {
    // TODO: Add authentication check for admin role
    // For now, we'll assume the request is authorized

    const deletedForum = await db
      .delete(nxtHerForums)
      .where(eq(nxtHerForums.id, params.forumId))
      .returning();

    if (deletedForum.length === 0) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Forum deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum:", error);
    return NextResponse.json(
      { error: "Failed to delete forum" },
      { status: 500 }
    );
  }
}