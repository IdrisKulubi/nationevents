import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForumPosts } from "@/db/nxt-her-schema";
import { eq } from "drizzle-orm";

// POST /api/nxt-her/forums/[forumId]/posts/[postId]/moderate - Moderate a post
export async function POST(
  request: NextRequest,
  { params }: { params: { forumId: string; postId: string } }
) {
  try {
    const body = await request.json();
    const { action, moderatorId } = body;

    if (!action || !moderatorId) {
      return NextResponse.json(
        { error: "Action and moderator ID are required" },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to ensure the user is a moderator
    // For now, we'll assume the request is authorized

    let updateData: Partial<typeof nxtHerForumPosts.$inferInsert> = {
      updatedAt: new Date(),
    };

    switch (action) {
      case "hide":
        updateData.isModerated = true;
        break;
      case "show":
        updateData.isModerated = false;
        break;
      case "delete":
        // Delete the post
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

        return NextResponse.json({ 
          message: "Post deleted successfully",
          action: "delete"
        });
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedPost = await db
      .update(nxtHerForumPosts)
      .set(updateData)
      .where(eq(nxtHerForumPosts.id, params.postId))
      .returning();

    if (updatedPost.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Post ${action}d successfully`,
      action,
      post: updatedPost[0]
    });
  } catch (error) {
    console.error("Error moderating post:", error);
    return NextResponse.json(
      { error: "Failed to moderate post" },
      { status: 500 }
    );
  }
}