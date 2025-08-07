import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForums, nxtHerForumPosts, nxtHerAttendees } from "@/db/nxt-her-schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/nxt-her/forums - Get all forums with post counts
export async function GET() {
  try {
    const forumsWithStats = await db
      .select({
        id: nxtHerForums.id,
        title: nxtHerForums.title,
        description: nxtHerForums.description,
        category: nxtHerForums.category,
        isActive: nxtHerForums.isActive,
        postCount: count(nxtHerForumPosts.id),
        lastPostAt: sql<Date | null>`MAX(${nxtHerForumPosts.createdAt})`,
        lastPostAuthor: sql<string | null>`
          (SELECT CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})
           FROM ${nxtHerAttendees} 
           WHERE ${nxtHerAttendees.id} = (
             SELECT ${nxtHerForumPosts.authorAttendeeId}
             FROM ${nxtHerForumPosts}
             WHERE ${nxtHerForumPosts.forumId} = ${nxtHerForums.id}
             ORDER BY ${nxtHerForumPosts.createdAt} DESC
             LIMIT 1
           ))
        `
      })
      .from(nxtHerForums)
      .leftJoin(nxtHerForumPosts, eq(nxtHerForums.id, nxtHerForumPosts.forumId))
      .where(eq(nxtHerForums.isActive, true))
      .groupBy(nxtHerForums.id)
      .orderBy(desc(nxtHerForums.createdAt));

    return NextResponse.json(forumsWithStats);
  } catch (error) {
    console.error("Error fetching forums:", error);
    return NextResponse.json(
      { error: "Failed to fetch forums" },
      { status: 500 }
    );
  }
}

// POST /api/nxt-her/forums - Create a new forum (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, moderatorIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // TODO: Add authentication check for admin/moderator role
    // For now, we'll assume the request is authorized

    const newForum = await db
      .insert(nxtHerForums)
      .values({
        id: nanoid(),
        eventId: "nxt-her-summit-2024", // TODO: Get from context/session
        title,
        description,
        category,
        moderatorIds: moderatorIds || [],
        isActive: true,
      })
      .returning();

    return NextResponse.json(newForum[0], { status: 201 });
  } catch (error) {
    console.error("Error creating forum:", error);
    return NextResponse.json(
      { error: "Failed to create forum" },
      { status: 500 }
    );
  }
}