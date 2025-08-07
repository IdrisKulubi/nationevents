import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PostCreationForm } from "@/components/nxt-her/forums/post-creation-form";
import { ForumNavigation } from "@/components/nxt-her/forums/forum-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NewPostPageProps {
  params: {
    forumId: string;
  };
}

async function getForum(forumId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums/${forumId}`,
      { cache: 'no-store' }
    );
    
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

function NewPostFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}

async function NewPostContent({ forumId }: { forumId: string }) {
  const forum = await getForum(forumId);

  if (!forum) {
    notFound();
  }

  // TODO: Get current attendee ID from session
  const currentAttendeeId = "temp-attendee-id";

  return (
    <div className="space-y-6">
      {/* Forum Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create New Post</CardTitle>
          <CardDescription>
            You're creating a new discussion in <strong>{forum.title}</strong>
            {forum.description && (
              <>
                <br />
                {forum.description}
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Post Creation Form */}
      <PostCreationForm
        forumId={forumId}
        forumTitle={forum.title}
        authorAttendeeId={currentAttendeeId}
      />

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posting Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• <strong>Be respectful:</strong> Treat all participants with courtesy and professionalism</p>
          <p>• <strong>Stay on topic:</strong> Keep discussions relevant to the forum theme</p>
          <p>• <strong>Use clear titles:</strong> Help others understand what your post is about</p>
          <p>• <strong>Search first:</strong> Check if your topic has already been discussed</p>
          <p>• <strong>Be constructive:</strong> Contribute meaningfully to the conversation</p>
          <p>• <strong>No spam:</strong> Avoid repetitive or promotional content</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPostPage({ params }: NewPostPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ForumNavigation showBackButton />
      
      <Suspense fallback={<NewPostFormSkeleton />}>
        <NewPostContent forumId={params.forumId} />
      </Suspense>
    </div>
  );
}