import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users } from "lucide-react";
import { getNxtHerSessionsWithSpeakers } from "@/lib/actions/nxt-her-speaker-actions";
import { SessionsWithSpeakersList } from "@/components/nxt-her/speakers/sessions-with-speakers-list";

export const metadata: Metadata = {
  title: "Sessions | Nxt Her Summit",
  description: "Explore all sessions at the Nxt Her Summit. Discover keynotes, panels, workshops, and networking sessions with their speakers.",
};

// Loading component for sessions
function SessionsLoading() {
  return (
    <div className="space-y-6">
      {/* Search and filters loading */}
      <div className="space-y-4">
        <Skeleton className="w-full h-10" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-18 h-6" />
          </div>
        </div>
      </div>

      {/* Sessions loading */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="w-64 h-6" />
                  <div className="flex gap-2">
                    <Skeleton className="w-16 h-6" />
                    <Skeleton className="w-20 h-6" />
                  </div>
                </div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-4" />
                </div>
                <div className="border-t pt-4">
                  <Skeleton className="w-32 h-4 mb-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-40 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main sessions content component
async function SessionsContent() {
  const sessions = await getNxtHerSessionsWithSpeakers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-pink-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Sessions</h2>
          <p className="text-gray-600 mt-1">
            Explore all {sessions.length} sessions at the Nxt Her Summit with their speakers
          </p>
        </div>
      </div>

      <SessionsWithSpeakersList sessions={sessions} />
    </div>
  );
}

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Summit Sessions
            </h1>
            <p className="text-xl md:text-2xl text-pink-100 leading-relaxed">
              Discover all the inspiring sessions, keynotes, panels, and workshops 
              featuring our distinguished speakers at the Nxt Her Summit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SessionsLoading />}>
            <SessionsContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}