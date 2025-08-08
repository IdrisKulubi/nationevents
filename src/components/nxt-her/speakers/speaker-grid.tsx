"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { SpeakerListItem } from "@/lib/types/nxt-her-speakers";
import { SpeakerList } from "./speaker-list";

interface SpeakerGridProps {
  speakers: SpeakerListItem[];
  className?: string;
}

export function SpeakerGrid({ speakers, className = "" }: SpeakerGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showKeynoteOnly, setShowKeynoteOnly] = useState(false);

  // Get all unique expertise areas
  const allExpertise = Array.from(
    new Set(
      speakers.flatMap(speaker => speaker.expertise || [])
    )
  ).sort();

  // Filter speakers based on search and filters
  const filteredSpeakers = speakers.filter(speaker => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));

    // Expertise filter
    const matchesExpertise = selectedExpertise.length === 0 ||
      selectedExpertise.some(exp => speaker.expertise?.includes(exp));

    // Keynote filter
    const matchesKeynote = !showKeynoteOnly || speaker.isKeynote;

    return matchesSearch && matchesExpertise && matchesKeynote;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedExpertise([]);
    setShowKeynoteOnly(false);
  };

  const hasActiveFilters = searchTerm !== "" || selectedExpertise.length > 0 || showKeynoteOnly;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search speakers by name, title, organization, or expertise..."
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

          {/* Keynote Filter */}
          <Button
            variant={showKeynoteOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowKeynoteOnly(!showKeynoteOnly)}
            className={showKeynoteOnly ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            Keynote Speakers Only
          </Button>

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

        {/* Expertise Filter Tags */}
        {allExpertise.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Filter by Expertise:</p>
            <div className="flex flex-wrap gap-2">
              {allExpertise.map((expertise) => (
                <Badge
                  key={expertise}
                  variant={selectedExpertise.includes(expertise) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedExpertise.includes(expertise)
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedExpertise(prev =>
                      prev.includes(expertise)
                        ? prev.filter(exp => exp !== expertise)
                        : [...prev, expertise]
                    );
                  }}
                >
                  {expertise}
                </Badge>
              ))}
            </div>
          </div>
        )}

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
            
            {showKeynoteOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Keynote Only
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setShowKeynoteOnly(false)}
                />
              </Badge>
            )}
            
            {selectedExpertise.map((expertise) => (
              <Badge key={expertise} variant="secondary" className="flex items-center gap-1">
                {expertise}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedExpertise(prev => prev.filter(exp => exp !== expertise))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredSpeakers.length} of {speakers.length} speakers
          {hasActiveFilters && " (filtered)"}
        </p>
        
        {filteredSpeakers.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{filteredSpeakers.filter(s => s.isKeynote).length} keynote</span>
            <span>{filteredSpeakers.filter(s => !s.isKeynote).length} regular</span>
          </div>
        )}
      </div>

      {/* Speaker List */}
      <SpeakerList speakers={filteredSpeakers} />
    </div>
  );
}