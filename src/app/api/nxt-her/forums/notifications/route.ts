import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForumPosts, nxtHerAttendees, nxtHerForums } from "@/db/nxt-her-schema";
import { eq, desc, and, sql } from "drizzle-orm";

// GET /api/nxt-her/forums/notifications - Get forum notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attendeeId = searchParams.get("attendeeId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!attendeeId) {
      return NextResponse.json(
        { error: "Attendee ID is required" },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to ensure the user can access these notifications
    // For now, we'll assume the request is authorized

    // For now, we'll return recent forum activity as notifications
    // In a real implementation, you'd have a dedicated notifications table
    const recentActivity = await db
      .select({
        id: nxtHerForumPosts.id,
        type: sql<string>`CASE 
          WHEN ${nxtHerForumPosts.parentPostId} IS NULL THEN 'new_post'
          ELSE 'new_reply'
        END`,
        title: sql<string>`CASE 
          WHEN ${nxtHerForumPosts.parentPostId} IS NULL THEN 'New post in forum'
          ELSE 'New reply to discussion'
        END`,
        message: sql<string>`CASE 
          WHEN ${nxtHerForumPosts.parentPostId} IS NULL 
          THEN CONCAT('New discussion started: "', COALESCE(${nxtHerForumPosts.title}, 'Untitled'), '"')
          ELSE CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName}, ' replied to a discussion')
        END`,
        forumId: nxtHerForums.id,
        forumTitle: nxtHerForums.title,
        postId: nxtHerForumPosts.id,
        authorName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        createdAt: nxtHerForumPosts.createdAt,
        isRead: sql<boolean>`false`, // For now, all notifications are unread
      })
      .from(nxtHerForumPosts)
      .innerJoin(nxtHerAttendees, eq(nxtHerForumPosts.authorAttendeeId, nxtHerAttendees.id))
      .innerJoin(nxtHerForums, eq(nxtHerForumPosts.forumId, nxtHerForums.id))
      .where(
        and(
          eq(nxtHerForums.isActive, true),
          // Don't include the user's own posts as notifications
          sql`${nxtHerForumPosts.authorAttendeeId} != ${attendeeId}`
        )
      )
      .orderBy(desc(nxtHerForumPosts.createdAt))
      .limit(limit);

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error("Error fetching forum notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/nxt-her/forums/notifications/mark-read - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendeeId, notificationIds } = body;

    if (!attendeeId || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Attendee ID and notification IDs are required" },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to ensure the user can mark these notifications as read
    // For now, we'll assume the request is authorized

    // TODO: In a real implementation, you'd update a notifications table
    // For now, we'll just return success since we don't have persistent notification state

    console.log(`Marking notifications as read for attendee ${attendeeId}:`, notificationIds);

    return NextResponse.json({
      message: "Notifications marked as read",
      markedCount: notificationIds.length
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}