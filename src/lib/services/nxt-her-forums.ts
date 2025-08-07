import { db } from "@/db/drizzle";
import { nxtHerForums, nxtHerForumPosts, nxtHerAttendees } from "@/db/nxt-her-schema";
import { eq, desc, count, sql, and, isNull } from "drizzle-orm";

export interface ForumWithStats {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  postCount: number;
  lastPostAt: Date | null;
  lastPostAuthor: string | null;
}

export interface ForumPost {
  id: string;
  title: string | null;
  content: string;
  authorName: string;
  authorProfilePhoto: string | null;
  createdAt: Date;
  isModerated: boolean;
  replyCount: number;
  lastReplyAt: Date | null;
  lastReplyAuthor: string | null;
}

export interface ForumDetails {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  moderatorIds: string[];
}

export async function getForumsWithStats(): Promise<ForumWithStats[]> {
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

    return forumsWithStats;
  } catch (error) {
    console.error("Error fetching forums with stats:", error);
    return [];
  }
}

export async function getForumById(forumId: string): Promise<ForumDetails | null> {
  try {
    const forum = await db.query.nxtHerForums.findFirst({
      where: eq(nxtHerForums.id, forumId),
    });

    if (!forum || !forum.isActive) {
      return null;
    }

    return {
      id: forum.id,
      title: forum.title,
      description: forum.description,
      category: forum.category,
      isActive: forum.isActive,
      moderatorIds: forum.moderatorIds || [],
    };
  } catch (error) {
    console.error("Error fetching forum:", error);
    return null;
  }
}

export async function getForumPosts(forumId: string): Promise<ForumPost[]> {
  try {
    // First verify the forum exists and is active
    const forum = await getForumById(forumId);
    if (!forum) {
      return [];
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
        and(
          eq(nxtHerForumPosts.forumId, forumId),
          isNull(nxtHerForumPosts.parentPostId)
        )
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

    return postsWithDetails;
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
}

export async function getForumCategories(): Promise<{ id: string; name: string; count: number }[]> {
  try {
    const categories = await db
      .select({
        category: nxtHerForums.category,
        count: count(nxtHerForums.id),
      })
      .from(nxtHerForums)
      .where(eq(nxtHerForums.isActive, true))
      .groupBy(nxtHerForums.category)
      .having(sql`${nxtHerForums.category} IS NOT NULL`);

    return categories
      .filter(cat => cat.category !== null)
      .map(cat => ({
        id: cat.category!,
        name: cat.category!,
        count: cat.count,
      }));
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return [];
  }
}

export async function checkModerationPermissions(
  attendeeId: string,
  forumId: string
): Promise<boolean> {
  try {
    const forum = await getForumById(forumId);
    if (!forum) {
      return false;
    }

    // Check if the attendee is a moderator for this forum
    return forum.moderatorIds.includes(attendeeId);
  } catch (error) {
    console.error("Error checking moderation permissions:", error);
    return false;
  }
}

export async function getRecentForumActivity(limit: number = 10) {
  try {
    const recentActivity = await db
      .select({
        id: nxtHerForumPosts.id,
        content: nxtHerForumPosts.content,
        createdAt: nxtHerForumPosts.createdAt,
        authorName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        forumTitle: nxtHerForums.title,
        forumId: nxtHerForums.id,
        isReply: sql<boolean>`${nxtHerForumPosts.parentPostId} IS NOT NULL`,
      })
      .from(nxtHerForumPosts)
      .innerJoin(nxtHerAttendees, eq(nxtHerForumPosts.authorAttendeeId, nxtHerAttendees.id))
      .innerJoin(nxtHerForums, eq(nxtHerForumPosts.forumId, nxtHerForums.id))
      .where(eq(nxtHerForums.isActive, true))
      .orderBy(desc(nxtHerForumPosts.createdAt))
      .limit(limit);

    return recentActivity;
  } catch (error) {
    console.error("Error fetching recent forum activity:", error);
    return [];
  }
}