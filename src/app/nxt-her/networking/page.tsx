import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { NetworkingProfileClient } from "@/components/nxt-her/networking/networking-profile-client";
import { ConnectionSuggestions } from "@/components/nxt-her/networking/connection-suggestions";
import { ConnectionRequests } from "@/components/nxt-her/networking/connection-requests";
import { AttendeeDirectory } from "@/components/nxt-her/networking/attendee-directory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Network, Target, UserPlus, MessageCircle, Search } from "lucide-react";

export default async function NetworkingProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/nxt-her/login");
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          Networking Profile
        </h1>
        <p className="text-muted-foreground text-lg">
          Set up your networking preferences to connect with like-minded attendees and discover meaningful opportunities.
        </p>
      </div>

      {/* Benefits Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Smart Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get personalized connection suggestions based on your interests, goals, and expertise.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Quality Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect with attendees who share your professional interests and networking goals.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Expand Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Discover new opportunities for mentorship, partnerships, and professional growth.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Directory
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Suspense fallback={<NetworkingProfileSkeleton />}>
            <NetworkingProfileClient />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="suggestions" className="mt-6">
          <Suspense fallback={<ConnectionSuggestionsSkeleton />}>
            <ConnectionSuggestions />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          <Suspense fallback={<ConnectionRequestsSkeleton />}>
            <ConnectionRequests />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="directory" className="mt-6">
          <Suspense fallback={<AttendeeDirectorySkeleton />}>
            <AttendeeDirectory />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NetworkingProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="flex-1 h-2 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
      </Card>

      {/* Profile Visibility Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-80" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Networking Preferences Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-88" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-96" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-24 rounded-full" />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
function C
onnectionSuggestionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}f
unction ConnectionRequestsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="flex space-x-1 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full mb-3 rounded-lg" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}f
unction AttendeeDirectorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}