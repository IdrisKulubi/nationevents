import { Suspense } from "react";
import { ForumList } from "@/components/nxt-her/forums/forum-list";
import { ForumNavigation } from "@/components/nxt-her/forums/forum-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, TrendingUp } from "lucide-react";

async function getForums() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/nxt-her/forums`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch forums');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forums:', error);
    return [];
  }
}

function ForumListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ForumsContent() {
  const forums = await getForums();
  
  return <ForumList forums={forums} />;
}

export default function ForumsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ForumNavigation />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discussion Forums</h1>
        <p className="text-muted-foreground text-lg">
          Connect with fellow attendees, share insights, and engage in meaningful discussions 
          about the topics that matter most to you.
        </p>
      </div>

      {/* Forum Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forums</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Covering key summit themes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              Engaged in discussions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Posts and replies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forums List */}
      <Suspense fallback={<ForumListSkeleton />}>
        <ForumsContent />
      </Suspense>
    </div>
  );
}