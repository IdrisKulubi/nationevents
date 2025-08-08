"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { SpeakerProfileData } from "@/lib/types/nxt-her-speakers";
import { format, isSameDay, parseISO } from "date-fns";

interface SpeakerScheduleViewProps {
  speakerData: SpeakerProfileData;
  className?: string;
}

export function SpeakerScheduleView({ speakerData, className = "" }: SpeakerScheduleViewProps) {
  const { speaker, sessions } = speakerData;

  if (sessions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {speaker.name}'s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No sessions scheduled for this speaker.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  // Sort dates
  const sortedDates = Object.keys(sessionsByDate).sort();

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {speaker.name}'s Schedule
        </CardTitle>
        <p className="text-sm text-gray-600">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} across {sortedDates.length} {sortedDates.length === 1 ? 'day' : 'days'}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {sortedDates.map((dateKey) => {
          const dateSessions = sessionsByDate[dateKey].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          
          return (
            <div key={dateKey} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Calendar className="w-4 h-4 text-pink-600" />
                <h3 className="font-semibold text-lg text-gray-900">
                  {format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}
                </h3>
                <Badge variant="outline" className="ml-auto">
                  {dateSessions.length} {dateSessions.length === 1 ? 'session' : 'sessions'}
                </Badge>
              </div>

              {/* Sessions for this date */}
              <div className="space-y-3">
                {dateSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Session Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-start gap-2">
                            <h4 className="font-semibold text-gray-900 flex-1">
                              {session.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getRoleColor(session.role)}>
                                {session.role}
                              </Badge>
                              {session.sessionType && (
                                <Badge className={getSessionTypeColor(session.sessionType)}>
                                  {session.sessionType}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {session.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}