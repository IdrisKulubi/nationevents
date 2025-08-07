import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForumPostList } from "@/components/nxt-her/forums/forum-post-list";
import { ForumNavigation } from "@/components/nxt-her/forums/forum-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, Clock } from "lucide-react";

interface ForumPageProps {
  params: {
    forumId: string;
  };
}

async function getForum(forumId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums/${forumId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch forum');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forum:', error);
    return null;
  }
}

async function getForumPosts(forumId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums/${forumId}/posts`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch forum posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return [];
  }
}

function ForumPostsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ForumContent({ forumId }: { forumId: string }) {
  const [forum, posts] = await Promise.all([
    getForum(forumId),
    getForumPosts(forumId)
  ]);

  if (!forum) {
    notFound();
  }

  return (
    <>
      {/* Forum Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{forum.title}</CardTitle>
              {forum.description && (
                <CardDescription className="text-base">
                  {forum.description}
                </CardDescription>
              )}
              {forum.category && (
                <Badge variant="secondary" className="w-fit">
                  {forum.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{posts.length} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{new Set(posts.map((p: any) => p.authorName)).size} participants</span>
            </div>
            {posts.length > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Last activity {new Date(Math.max(...posts.map((p: any) => new Date(p.lastReplyAt || p.createdAt).getTime()))).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <ForumPostList posts={posts} forumId={forumId} />
    </>
  );
}

export default function ForumPage({ params }: ForumPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ForumNavigation showBackButton />
      
      <Suspense fallback={<ForumPostsSkeleton />}>
        <ForumContent forumId={params.forumId} />
      </Suspense>
    </div>
  );
}