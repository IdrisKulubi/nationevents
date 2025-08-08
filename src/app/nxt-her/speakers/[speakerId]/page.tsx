import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { getNxtHerSpeakerById } from "@/lib/actions/nxt-her-speaker-actions";
import { SpeakerProfileCard } from "@/components/nxt-her/speakers/speaker-profile-card";

interface SpeakerPageProps {
  params: {
    speakerId: string;
  };
}

// Generate metadata for the speaker page
export async function generateMetadata({ params }: SpeakerPageProps): Promise<Metadata> {
  const speakerData = await getNxtHerSpeakerById(params.speakerId);
  
  if (!speakerData) {
    return {
      title: "Speaker Not Found | Nxt Her Summit",
      description: "The requested speaker profile could not be found.",
    };
  }

  const { speaker } = speakerData;
  
  return {
    title: `${speaker.name} | Nxt Her Summit Speakers`,
    description: `Learn about ${speaker.name}${speaker.jobTitle ? `, ${speaker.jobTitle}` : ''}${speaker.organization ? ` at ${speaker.organization}` : ''}. ${speaker.bio.slice(0, 150)}...`,
    openGraph: {
      title: `${speaker.name} - Nxt Her Summit Speaker`,
      description: speaker.bio.slice(0, 200),
      images: speaker.profilePhotoUrl ? [speaker.profilePhotoUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${speaker.name} - Nxt Her Summit Speaker`,
      description: speaker.bio.slice(0, 200),
      images: speaker.profilePhotoUrl ? [speaker.profilePhotoUrl] : [],
    },
  };
}

// Loading component for speaker profile
function SpeakerProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Speaker Header Loading */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="w-48 h-6" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
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
          </div>
          <div className="mt-6 space-y-2">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Sessions Loading */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="w-32 h-8 mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main speaker profile content
async function SpeakerProfileContent({ speakerId }: { speakerId: string }) {
  const speakerData = await getNxtHerSpeakerById(speakerId);

  if (!speakerData) {
    notFound();
  }

  return <SpeakerProfileCard speakerData={speakerData} />;
}

export default function SpeakerPage({ params }: SpeakerPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/nxt-her/speakers">
              <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Back to All Speakers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<SpeakerProfileLoading />}>
          <SpeakerProfileContent speakerId={params.speakerId} />
        </Suspense>
      </div>

      {/* Related Actions */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Explore More
            </h3>
            <p className="text-gray-600">
              Discover other inspiring speakers and sessions at the Nxt Her Summit
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/nxt-her/speakers">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View All Speakers
                </Button>
              </Link>
              <Link href="/nxt-her/schedule">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}