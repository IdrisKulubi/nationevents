"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Star } from "lucide-react";
import { SpeakerListItem } from "@/lib/types/nxt-her-speakers";
import Link from "next/link";

interface KeynoteSpeakersShowcaseProps {
  keynoteSpeakers: SpeakerListItem[];
  className?: string;
}

export function KeynoteSpeakersShowcase({ keynoteSpeakers, className = "" }: KeynoteSpeakersShowcaseProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (keynoteSpeakers.length === 0) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-pink-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Keynote Speakers
            </CardTitle>
          </div>
          <Link href="/nxt-her/speakers">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              View All Speakers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keynoteSpeakers.map((speaker) => (
            <Link key={speaker.id} href={`/nxt-her/speakers/${speaker.id}`}>
              <div className="group cursor-pointer">
                <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Keynote Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 shadow-lg">
                      Keynote Speaker
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    {/* Profile Photo */}
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                        <AvatarImage 
                          src={speaker.profilePhotoUrl} 
                          alt={speaker.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                          {getInitials(speaker.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Decorative ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-pink-200 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Speaker Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-pink-600 transition-colors">
                        {speaker.name}
                      </h3>
                      
                      {(speaker.jobTitle || speaker.organization) && (
                        <div className="space-y-1">
                          {speaker.jobTitle && (
                            <p className="text-sm font-medium text-gray-700">
                              {speaker.jobTitle}
                            </p>
                          )}
                          {speaker.organization && (
                            <p className="text-sm text-gray-600">
                              {speaker.organization}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Session Count */}
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          {speaker.sessionCount} {speaker.sessionCount === 1 ? 'session' : 'sessions'}
                        </Badge>
                      </div>

                      {/* Top Expertise Areas */}
                      {speaker.expertise && speaker.expertise.length > 0 && (
                        <div className="pt-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            {speaker.expertise.slice(0, 2).map((area, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                                {area}
                              </Badge>
                            ))}
                            {speaker.expertise.length > 2 && (
                              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                                +{speaker.expertise.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover Effect */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                      <div className="flex items-center gap-1 text-pink-600 text-sm font-medium">
                        View Profile
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        {keynoteSpeakers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Discover insights from our distinguished keynote speakers and explore all summit speakers.
            </p>
            <Link href="/nxt-her/speakers">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                Explore All Speakers
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}