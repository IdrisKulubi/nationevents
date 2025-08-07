"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  BookmarkCheck, 
  AlertTriangle,
  Star,
  Video,
  Building
} from "lucide-react";
import { format } from "date-fns";
import type { PersonalizedAgenda, AgendaSession } from "@/lib/services/nxt-her-agenda";

interface PersonalizedAgendaProps {
  agenda: PersonalizedAgenda;
  onBookmarkToggle?: (sessionId: string) => void;
}

export function PersonalizedAgenda({ agenda, onBookmarkToggle }: PersonalizedAgendaProps) {
  const [activeTab, setActiveTab] = useState("recommended");

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM d");
  };

  const getSessionTypeColor = (type: string | null) => {
    switch (type) {
      case "keynote":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "panel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "workshop":
        return "bg-green-100 text-green-800 border-green-200";
      case "networking":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const SessionCard = ({ session }: { session: AgendaSession }) => (
    <Card className={`hover:shadow-md transition-shadow ${session.hasConflict ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{session.title}</h4>
              {session.hasConflict && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={getSessionTypeColor(session.sessionType)}>
                {session.sessionType || "Session"}
              </Badge>
              
              {session.track && (
                <Badge variant="outline" className="text-xs">
                  {session.track}
                </Badge>
              )}
              
              {session.pillar && (
                <Badge variant="outline" className="text-xs">
                  {session.pillar}
                </Badge>
              )}
              
              {session.relevanceScore > 0.7 && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmarkToggle?.(session.id)}
            className="ml-2"
          >
            {session.isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-purple-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {session.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {session.isVirtual ? (
              <>
                <Video className="h-4 w-4" />
                <span>Virtual</span>
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                <span>{session.venue || "TBD"}</span>
              </>
            )}
          </div>
          
          {session.speakers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{session.speakers.length} speaker{session.speakers.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {session.speakers.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Speakers:</p>
            <div className="flex flex-wrap gap-2">
              {session.speakers.slice(0, 3).map((speaker) => (
                <div key={speaker.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={speaker.profilePhotoUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">
                    {speaker.name}
                    {speaker.role !== 'speaker' && ` (${speaker.role})`}
                  </span>
                </div>
              ))}
              {session.speakers.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{session.speakers.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {session.matchReasons.length > 0 && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Why this session:</p>
            <div className="flex flex-wrap gap-1">
              {session.matchReasons.slice(0, 2).map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Agenda Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{agenda.stats.totalSessions}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{agenda.stats.bookmarkedSessions}</div>
            <div className="text-sm text-gray-600">Bookmarked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{agenda.stats.conflictingSessions}</div>
            <div className="text-sm text-gray-600">Conflicts</div>
          </CardContent>
        </Card>
      </div>

      {/* Agenda Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recommended for You
              </CardTitle>
              <CardDescription>
                Sessions tailored to your interests and expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agenda.recommendedSessions.length > 0 ? (
                <div className="space-y-4">
                  {agenda.recommendedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No personalized recommendations available. Complete your profile to get better suggestions.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-purple-500" />
                Your Bookmarked Sessions
              </CardTitle>
              <CardDescription>
                Sessions you've saved to your personal agenda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agenda.bookmarkedSessions.length > 0 ? (
                <div className="space-y-4">
                  {agenda.bookmarkedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No bookmarked sessions yet. Browse sessions and bookmark the ones you're interested in.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Schedule Conflicts
              </CardTitle>
              <CardDescription>
                Sessions that overlap in time - you'll need to choose
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agenda.conflictingSessions.length > 0 ? (
                <div className="space-y-6">
                  {agenda.conflictingSessions.map((conflict, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-orange-50">
                      <h4 className="font-semibold text-orange-800 mb-3">
                        Time Slot: {conflict.timeSlot}
                      </h4>
                      <div className="space-y-3">
                        {conflict.sessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No schedule conflicts detected. Your bookmarked sessions don't overlap.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                All Sessions
              </CardTitle>
              <CardDescription>
                Complete list of all available sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agenda.sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}