import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star } from "lucide-react";
import { getNxtHerSpeakers, getNxtHerKeynoteSpeakers } from "@/lib/actions/nxt-her-speaker-actions";
import { SpeakerGrid } from "@/components/nxt-her/speakers/speaker-grid";
import { KeynoteSpeakersShowcase } from "@/components/nxt-her/speakers/keynote-speakers-showcase";

export const metadata: Metadata = {
  title: "Speakers | Nxt Her Summit",
  description: "Meet the inspiring speakers at the Nxt Her Summit. Discover keynote speakers, panelists, and workshop leaders who are shaping the future.",
};

// Loading component for speakers
function SpeakersLoading() {
  return (
    <div className="space-y-8">
      {/* Keynote Speakers Loading */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-48 h-8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="w-32 h-6 mx-auto" />
                <Skeleton className="w-40 h-4 mx-auto" />
                <Skeleton className="w-20 h-4 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Speakers Loading */}
      <div className="space-y-6">
        <Skeleton className="w-full h-10" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                  <Skeleton className="w-32 h-6 mx-auto" />
                  <Skeleton className="w-40 h-4 mx-auto" />
                  <Skeleton className="w-20 h-4 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main speakers content component
async function SpeakersContent() {
  const [allSpeakers, keynoteSpeakers] = await Promise.all([
    getNxtHerSpeakers(),
    getNxtHerKeynoteSpeakers(),
  ]);

  return (
    <div className="space-y-8">
      {/* Keynote Speakers Showcase */}
      {keynoteSpeakers.length > 0 && (
        <KeynoteSpeakersShowcase keynoteSpeakers={keynoteSpeakers} />
      )}

      {/* All Speakers Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-pink-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All Speakers</h2>
            <p className="text-gray-600 mt-1">
              Explore all {allSpeakers.length} speakers participating in the Nxt Her Summit
            </p>
          </div>
        </div>

        <SpeakerGrid speakers={allSpeakers} />
      </div>
    </div>
  );
}

export default function SpeakersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our Speakers
            </h1>
            <p className="text-xl md:text-2xl text-pink-100 leading-relaxed">
              Discover the inspiring voices and visionary leaders who will share their insights, 
              experiences, and expertise at the Nxt Her Summit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SpeakersLoading />}>
            <SpeakersContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}