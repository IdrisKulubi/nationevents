import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PostThread } from "@/components/nxt-her/forums/post-thread";
import { ForumNavigation } from "@/components/nxt-her/forums/forum-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PostPageProps {
  params: {
    forumId: string;
    postId: string;
  };
}

async function getPostWithReplies(forumId: string, postId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums/${forumId}/posts/${postId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch post');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getForum(forumId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums/${forumId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forum:', error);
    return null;
  }
}

function PostThreadSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main Post Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>

      {/* Replies Skeleton */}
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="ml-8">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

async function PostContent({ forumId, postId }: { forumId: string; postId: string }) {
  const [postData, forum] = await Promise.all([
    getPostWithReplies(forumId, postId),
    getForum(forumId)
  ]);

  if (!postData || !forum) {
    notFound();
  }

  // TODO: Get current attendee ID from session
  const currentAttendeeId = "temp-attendee-id";
  
  // TODO: Check if current user can moderate
  const canModerate = false;

  const handleModerationAction = async (action: string, postId: string) => {
    try {
      const response = await fetch(
        `/api/nxt-her/forums/${forumId}/posts/${postId}/moderate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            moderatorId: currentAttendeeId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to moderate post");
      }

      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error("Moderation action failed:", error);
      throw error;
    }
  };

  return (
    <PostThread
      post={postData.post}
      replies={postData.replies}
      forumId={forumId}
      forumTitle={forum.title}
      currentAttendeeId={currentAttendeeId}
      canModerate={canModerate}
      onModerationAction={handleModerationAction}
    />
  );
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ForumNavigation showBackButton />
      
      <Suspense fallback={<PostThreadSkeleton />}>
        <PostContent forumId={params.forumId} postId={params.postId} />
      </Suspense>
    </div>
  );
}