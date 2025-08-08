"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar } from "lucide-react";
import { SessionWithSpeakers } from "@/lib/types/nxt-her-speakers";
import { SessionWithSpeakersCard } from "./session-with-speakers-card";
import { format } from "date-fns";

interface SessionsWithSpeakersListProps {
  sessions: SessionWithSpeakers[];
  className?: string;
}

export function SessionsWithSpeakersList({ sessions, className = "" }: SessionsWithSpeakersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);

  // Get unique values for filters
  const sessionTypes = Array.from(new Set(sessions.map(s => s.sessionType).filter(Boolean))).sort();
  const tracks = Array.from(new Set(sessions.map(s => s.track).filter(Boolean))).sort();
  const pillars = Array.from(new Set(sessions.map(s => s.pillar).filter(Boolean))).sort();

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.speakers.some(({ speaker }) => 
        speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.organization?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Session type filter
    const matchesSessionType = selectedSessionTypes.length === 0 ||
      (session.sessionType && selectedSessionTypes.includes(session.sessionType));

    // Track filter
    const matchesTrack = selectedTracks.length === 0 ||
      (session.track && selectedTracks.includes(session.track));

    // Pillar filter
    const matchesPillar = selectedPillars.length === 0 ||
      (session.pillar && selectedPillars.includes(session.pillar));

    return matchesSearch && matchesSessionType && matchesTrack && matchesPillar;
  });

  // Sort sessions by start time
  const sortedSessions = filteredSessions.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSessionTypes([]);
    setSelectedTracks([]);
    setSelectedPillars([]);
  };

  const hasActiveFilters = searchTerm !== "" || 
    selectedSessionTypes.length > 0 || 
    selectedTracks.length > 0 || 
    selectedPillars.length > 0;

  if (sessions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No sessions found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search sessions by title, description, or speaker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="space-y-3">
          {/* Session Types */}
          {sessionTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Session Types:</p>
              <div className="flex flex-wrap gap-2">
                {sessionTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedSessionTypes.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedSessionTypes.includes(type)
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedSessionTypes(prev =>
                        prev.includes(type)
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      );
                    }}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Tracks:</p>
              <div className="flex flex-wrap gap-2">
                {tracks.map((track) => (
                  <Badge
                    key={track}
                    variant={selectedTracks.includes(track) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedTracks.includes(track)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedTracks(prev =>
                        prev.includes(track)
                          ? prev.filter(t => t !== track)
                          : [...prev, track]
                      );
                    }}
                  >
                    {track}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pillars */}
          {pillars.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Pillars:</p>
              <div className="flex flex-wrap gap-2">
                {pillars.map((pillar) => (
                  <Badge
                    key={pillar}
                    variant={selectedPillars.includes(pillar) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedPillars.includes(pillar)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedPillars(prev =>
                        prev.includes(pillar)
                          ? prev.filter(p => p !== pillar)
                          : [...prev, pillar]
                      );
                    }}
                  >
                    {pillar}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSearchTerm("")}
                />
              </Badge>
            )}
            
            {selectedSessionTypes.map((type) => (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {type}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedSessionTypes(prev => prev.filter(t => t !== type))}
                />
              </Badge>
            ))}
            
            {selectedTracks.map((track) => (
              <Badge key={track} variant="secondary" className="flex items-center gap-1">
                {track}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedTracks(prev => prev.filter(t => t !== track))}
                />
              </Badge>
            ))}
            
            {selectedPillars.map((pillar) => (
              <Badge key={pillar} variant="secondary" className="flex items-center gap-1">
                {pillar}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedPillars(prev => prev.filter(p => p !== pillar))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {sortedSessions.length} of {sessions.length} sessions
          {hasActiveFilters && " (filtered)"}
        </p>
        
        {sortedSessions.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{sortedSessions.filter(s => s.sessionType === "keynote").length} keynote</span>
            <span>{sortedSessions.filter(s => s.sessionType === "panel").length} panel</span>
            <span>{sortedSessions.filter(s => s.sessionType === "workshop").length} workshop</span>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {sortedSessions.map((session) => (
          <SessionWithSpeakersCard 
            key={session.id} 
            session={session}
            showSpeakers={true}
          />
        ))}
      </div>

      {/* No Results */}
      {sortedSessions.length === 0 && hasActiveFilters && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No sessions match your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}