"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SpeakerListItem } from "@/lib/types/nxt-her-speakers";
import Link from "next/link";

interface SpeakerListProps {
  speakers: SpeakerListItem[];
  showSessionCount?: boolean;
  className?: string;
}

export function SpeakerList({ speakers, showSessionCount = true, className = "" }: SpeakerListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (speakers.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500 text-lg">No speakers found.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {speakers.map((speaker) => (
        <Link key={speaker.id} href={`/nxt-her/speakers/${speaker.id}`}>
          <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Profile Photo */}
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-gray-200 group-hover:border-pink-300 transition-colors">
                    <AvatarImage 
                      src={speaker.profilePhotoUrl} 
                      alt={speaker.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                      {getInitials(speaker.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {speaker.isKeynote && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1">
                        Keynote
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Speaker Info */}
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-pink-600 transition-colors">
                    {speaker.name}
                  </h3>
                  
                  {(speaker.jobTitle || speaker.organization) && (
                    <p className="text-sm text-gray-600 leading-tight">
                      {speaker.jobTitle}
                      {speaker.jobTitle && speaker.organization && (
                        <>
                          <br />
                          <span className="font-medium">{speaker.organization}</span>
                        </>
                      )}
                      {!speaker.jobTitle && speaker.organization && (
                        <span className="font-medium">{speaker.organization}</span>
                      )}
                    </p>
                  )}

                  {/* Session Count */}
                  {showSessionCount && (
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        {speaker.sessionCount} {speaker.sessionCount === 1 ? 'session' : 'sessions'}
                      </Badge>
                    </div>
                  )}

                  {/* Expertise Preview */}
                  {speaker.expertise && speaker.expertise.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap justify-center gap-1">
                        {speaker.expertise.slice(0, 2).map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {speaker.expertise.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{speaker.expertise.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}