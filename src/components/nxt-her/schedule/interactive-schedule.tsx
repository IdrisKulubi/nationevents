"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  BookmarkCheck, 
  Search,
  Filter,
  Grid,
  List,
  Video,
  Building,
  ExternalLink,
  X
} from "lucide-react";
import { format } from "date-fns";
import type { ScheduleData, ScheduleSession, ScheduleFilters } from "@/lib/services/nxt-her-schedule";

interface InteractiveScheduleProps {
  initialData: ScheduleData;
  onBookmarkToggle?: (sessionId: string) => void;
  onFiltersChange?: (filters: ScheduleFilters) => void;
}

export function InteractiveSchedule({ 
  initialData, 
  onBookmarkToggle,
  onFiltersChange 
}: InteractiveScheduleProps) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<ScheduleFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = (newFilters: ScheduleFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: ScheduleFilters = {};
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDate = (date: Date) => {
    return format(date, "EEE, MMM d");
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

  const SessionCard = ({ session, compact = false }: { session: ScheduleSession; compact?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                {session.title}
              </h4>
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

        {!compact && session.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {session.speakers.length > 0 && (
            <div className="flex items-center gap-2">
              {session.speakers.slice(0, 3).map((speaker) => (
                <Avatar key={speaker.id} className="h-6 w-6">
                  <AvatarImage src={speaker.profilePhotoUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {speaker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {session.speakers.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{session.speakers.length - 3}
                </span>
              )}
            </div>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <SessionDetailsModal session={session} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  const SessionDetailsModal = ({ session }: { session: ScheduleSession }) => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{session.title}</DialogTitle>
        <DialogDescription>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={getSessionTypeColor(session.sessionType)}>
              {session.sessionType || "Session"}
            </Badge>
            {session.track && <Badge variant="outline">{session.track}</Badge>}
            {session.pillar && <Badge variant="outline">{session.pillar}</Badge>}
          </div>
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            {session.isVirtual ? (
              <>
                <Video className="h-4 w-4" />
                <span>Virtual Session</span>
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                <span>{session.venue || "TBD"}</span>
              </>
            )}
          </div>
          {session.maxAttendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Max {session.maxAttendees} attendees</span>
            </div>
          )}
        </div>

        {session.description && (
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-gray-600">{session.description}</p>
          </div>
        )}

        {session.speakers.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Speakers</h4>
            <div className="space-y-3">
              {session.speakers.map((speaker) => (
                <div key={speaker.id} className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={speaker.profilePhotoUrl || undefined} />
                    <AvatarFallback>
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{speaker.name}</h5>
                      {speaker.role !== 'speaker' && (
                        <Badge variant="outline" className="text-xs">
                          {speaker.role}
                        </Badge>
                      )}
                    </div>
                    {speaker.jobTitle && speaker.organization && (
                      <p className="text-sm text-gray-600">
                        {speaker.jobTitle} at {speaker.organization}
                      </p>
                    )}
                    {speaker.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {speaker.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.meetingLink && (
          <div>
            <Button asChild className="w-full">
              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Virtual Session
              </a>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  const FilterPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Sessions</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by title, description, track..."
              className="pl-10"
              value={filters.searchQuery || ""}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value })}
            />
          </div>
        </div>

        {/* Days */}
        <div>
          <Label>Days</Label>
          <div className="space-y-2 mt-2">
            {data.filters.availableDays.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={filters.days?.includes(day) || false}
                  onCheckedChange={(checked) => {
                    const newDays = checked
                      ? [...(filters.days || []), day]
                      : (filters.days || []).filter(d => d !== day);
                    handleFilterChange({ ...filters, days: newDays });
                  }}
                />
                <Label htmlFor={`day-${day}`} className="text-sm">
                  {format(new Date(day), "EEE, MMM d")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        <div>
          <Label>Tracks</Label>
          <div className="space-y-2 mt-2">
            {data.filters.availableTracks.map((track) => (
              <div key={track} className="flex items-center space-x-2">
                <Checkbox
                  id={`track-${track}`}
                  checked={filters.tracks?.includes(track) || false}
                  onCheckedChange={(checked) => {
                    const newTracks = checked
                      ? [...(filters.tracks || []), track]
                      : (filters.tracks || []).filter(t => t !== track);
                    handleFilterChange({ ...filters, tracks: newTracks });
                  }}
                />
                <Label htmlFor={`track-${track}`} className="text-sm">
                  {track}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div>
          <Label>Session Types</Label>
          <div className="space-y-2 mt-2">
            {data.filters.availableSessionTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.sessionTypes?.includes(type) || false}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...(filters.sessionTypes || []), type]
                      : (filters.sessionTypes || []).filter(t => t !== type);
                    handleFilterChange({ ...filters, sessionTypes: newTypes });
                  }}
                />
                <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Type */}
        <div>
          <Label htmlFor="attendance-type">Attendance Type</Label>
          <Select
            value={filters.attendanceType || "both"}
            onValueChange={(value) => 
              handleFilterChange({ 
                ...filters, 
                attendanceType: value as "in_person" | "virtual" | "both" 
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">All Sessions</SelectItem>
              <SelectItem value="in_person">In-Person Only</SelectItem>
              <SelectItem value="virtual">Virtual Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with stats and view controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Interactive Schedule</h2>
          <p className="text-gray-600">
            Showing {data.stats.filteredSessions} of {data.stats.totalSessions} sessions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <FilterPanel />
        </div>

        {/* Sessions Grid/List */}
        <div className="lg:col-span-3">
          {data.sessions.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "space-y-4"
            }>
              {data.sessions.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  compact={viewMode === "list"}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  No sessions found matching your filters. Try adjusting your search criteria.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}