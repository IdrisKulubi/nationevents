"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { SessionWithSpeakers } from "@/lib/types/nxt-her-speakers";
import { format } from "date-fns";
import Link from "next/link";

interface SessionWithSpeakersCardProps {
  session: SessionWithSpeakers;
  showSpeakers?: boolean;
  className?: string;
}

export function SessionWithSpeakersCard({ 
  session, 
  showSpeakers = true, 
  className = "" 
}: SessionWithSpeakersCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "speaker":
        return "bg-green-100 text-green-800 border-green-200";
      case "panelist":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSessionTypeColor = (sessionType?: string) => {
    switch (sessionType) {
      case "keynote":
        return "bg-red-100 text-red-800 border-red-200";
      case "panel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "workshop":
        return "bg-green-100 text-green-800 border-green-200";
      case "networking":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "breakout":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Session Header */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-start gap-2">
                <h3 className="text-xl font-semibold text-gray-900 flex-1">
                  {session.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.sessionType && (
                    <Badge className={getSessionTypeColor(session.sessionType)}>
                      {session.sessionType}
                    </Badge>
                  )}
                </div>
              </div>

              {session.description && (
                <p className="text-gray-600 leading-relaxed">
                  {session.description}
                </p>
              )}

              {/* Session Details */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(session.startTime), "MMM d, yyyy")}
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                </div>

                {session.venue && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {session.isVirtual ? "Virtual" : session.venue}
                  </div>
                )}

                {session.maxAttendees && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max {session.maxAttendees} attendees
                  </div>
                )}
              </div>

              {/* Track and Pillar */}
              {(session.track || session.pillar) && (
                <div className="flex flex-wrap gap-2">
                  {session.track && (
                    <Badge variant="outline" className="text-xs">
                      Track: {session.track}
                    </Badge>
                  )}
                  {session.pillar && (
                    <Badge variant="outline" className="text-xs">
                      Pillar: {session.pillar}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Speakers Section */}
          {showSpeakers && session.speakers.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">
                  Speakers ({session.speakers.length})
                </h4>
              </div>

              <div className="space-y-3">
                {session.speakers.map(({ speaker, role }) => (
                  <Link 
                    key={speaker.id} 
                    href={`/nxt-her/speakers/${speaker.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors group">
                      {/* Speaker Avatar */}
                      <Avatar className="w-12 h-12 border-2 border-gray-200 group-hover:border-pink-300 transition-colors">
                        <AvatarImage 
                          src={speaker.profilePhotoUrl} 
                          alt={speaker.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                          {getInitials(speaker.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Speaker Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                            {speaker.name}
                          </h5>
                          <Badge className={getRoleColor(role)} size="sm">
                            {role}
                          </Badge>
                          {speaker.isKeynote && (
                            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">
                              Keynote
                            </Badge>
                          )}
                        </div>
                        
                        {(speaker.jobTitle || speaker.organization) && (
                          <p className="text-sm text-gray-600 truncate">
                            {speaker.jobTitle}
                            {speaker.jobTitle && speaker.organization && " at "}
                            {speaker.organization && (
                              <span className="font-medium">{speaker.organization}</span>
                            )}
                          </p>
                        )}

                        {/* Expertise Preview */}
                        {speaker.expertise && speaker.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
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
                        )}
                      </div>

                      {/* External Link Icon */}
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}