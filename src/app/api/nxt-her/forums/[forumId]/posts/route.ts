import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { nxtHerForumPosts, nxtHerAttendees, nxtHerForums } from "@/db/nxt-her-schema";
import { eq, desc, count, sql, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/nxt-her/forums/[forumId]/posts - Get all posts in a forum
export async function GET(
  request: NextRequest,
  { params }: { params: { forumId: string } }
) {
  try {
    // First verify the forum exists and is active
    const forum = await db.query.nxtHerForums.findFirst({
      where: eq(nxtHerForums.id, params.forumId),
    });

    if (!forum || !forum.isActive) {
      return NextResponse.json(
        { error: "Forum not found or inactive" },
        { status: 404 }
      );
    }

    // Get posts with author information and reply counts
    const postsWithDetails = await db
      .select({
        id: nxtHerForumPosts.id,
        title: nxtHerForumPosts.title,
        content: nxtHerForumPosts.content,
        createdAt: nxtHerForumPosts.createdAt,
        isModerated: nxtHerForumPosts.isModerated,
        authorName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        authorProfilePhoto: nxtHerAttendees.profilePhotoUrl,
        replyCount: count(sql`replies.id`),
        lastReplyAt: sql<Date | null>`MAX(replies.created_at)`,
        lastReplyAuthor: sql<string | null>`
          (SELECT CONCAT(reply_author.first_name, ' ', reply_author.last_name)
           FROM ${nxtHerAttendees} reply_author
           WHERE reply_author.id = (
             SELECT replies.author_attendee_id
             FROM ${nxtHerForumPosts} replies
             WHERE replies.parent_post_id = ${nxtHerForumPosts.id}
             ORDER BY replies.created_at DESC
             LIMIT 1
           ))
        `
      })
      .from(nxtHerForumPosts)
      .innerJoin(nxtHerAttendees, eq(nxtHerForumPosts.authorAttendeeId, nxtHerAttendees.id))
      .leftJoin(
        sql`${nxtHerForumPosts} replies`,
        sql`replies.parent_post_id = ${nxtHerForumPosts.id}`
      )
      .where(
        sql`${nxtHerForumPosts.forumId} = ${params.forumId} AND ${nxtHerForumPosts.parentPostId} IS NULL`
      )
      .groupBy(
        nxtHerForumPosts.id,
        nxtHerForumPosts.title,
        nxtHerForumPosts.content,
        nxtHerForumPosts.createdAt,
        nxtHerForumPosts.isModerated,
        nxtHerAttendees.firstName,
        nxtHerAttendees.lastName,
        nxtHerAttendees.profilePhotoUrl
      )
      .orderBy(desc(nxtHerForumPosts.createdAt));

    return NextResponse.json(postsWithDetails);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  }
}

// POST /api/nxt-her/forums/[forumId]/posts - Create a new post
export async function POST(
  request: NextRequest,
  { params }: { params: { forumId: string } }
) {
  try {
    const body = await request.json();
    const { title, content, authorAttendeeId } = body;

    if (!content || !authorAttendeeId) {
      return NextResponse.json(
        { error: "Content and author are required" },
        { status: 400 }
      );
    }

    // Verify the forum exists and is active
    const forum = await db.query.nxtHerForums.findFirst({
      where: eq(nxtHerForums.id, params.forumId),
    });

    if (!forum || !forum.isActive) {
      return NextResponse.json(
        { error: "Forum not found or inactive" },
        { status: 404 }
      );
    }

    // Verify the author exists
    const author = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.id, authorAttendeeId),
    });

    if (!author) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      );
    }

    // TODO: Add authentication check to ensure the user can post as this author
    // For now, we'll assume the request is authorized

    const newPost = await db
      .insert(nxtHerForumPosts)
      .values({
        id: nanoid(),
        forumId: params.forumId,
        authorAttendeeId,
        title,
        content,
        isModerated: false, // New posts are not moderated by default
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json(
      { error: "Failed to create forum post" },
      { status: 500 }
    );
  }
}