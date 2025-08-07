import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForumPosts, nxtHerAttendees } from "@/db/nxt-her-schema";
import { eq, sql } from "drizzle-orm";

// GET /api/nxt-her/forums/[forumId]/posts/[postId] - Get a specific post with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { forumId: string; postId: string } }
) {
  try {
    // Get the main post
    const post = await db
      .select({
        id: nxtHerForumPosts.id,
        title: nxtHerForumPosts.title,
        content: nxtHerForumPosts.content,
        createdAt: nxtHerForumPosts.createdAt,
        isModerated: nxtHerForumPosts.isModerated,
        authorName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        authorProfilePhoto: nxtHerAttendees.profilePhotoUrl,
      })
      .from(nxtHerForumPosts)
      .innerJoin(nxtHerAttendees, eq(nxtHerForumPosts.authorAttendeeId, nxtHerAttendees.id))
      .where(eq(nxtHerForumPosts.id, params.postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Get replies to this post
    const replies = await db
      .select({
        id: nxtHerForumPosts.id,
        content: nxtHerForumPosts.content,
        createdAt: nxtHerForumPosts.createdAt,
        isModerated: nxtHerForumPosts.isModerated,
        authorName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        authorProfilePhoto: nxtHerAttendees.profilePhotoUrl,
      })
      .from(nxtHerForumPosts)
      .innerJoin(nxtHerAttendees, eq(nxtHerForumPosts.authorAttendeeId, nxtHerAttendees.id))
      .where(eq(nxtHerForumPosts.parentPostId, params.postId))
      .orderBy(nxtHerForumPosts.createdAt);

    return NextResponse.json({
      post: post[0],
      replies,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/nxt-her/forums/[forumId]/posts/[postId] - Update a post (author or moderator only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { forumId: string; postId: string } }
) {
  try {
    const body = await request.json();
    const { title, content, authorAttendeeId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to ensure the user can edit this post
    // For now, we'll assume the request is authorized

    const updatedPost = await db
      .update(nxtHerForumPosts)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(nxtHerForumPosts.id, params.postId))
      .returning();

    if (updatedPost.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/nxt-her/forums/[forumId]/posts/[postId] - Delete a post (author or moderator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { forumId: string; postId: string } }
) {
  try {
    // TODO: Add authentication check to ensure the user can delete this post
    // For now, we'll assume the request is authorized

    const deletedPost = await db
      .delete(nxtHerForumPosts)
      .where(eq(nxtHerForumPosts.id, params.postId))
      .returning();

    if (deletedPost.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}