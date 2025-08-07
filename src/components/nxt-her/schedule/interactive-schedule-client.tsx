"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { InteractiveSchedule } from "./interactive-schedule";
import type { ScheduleData, ScheduleFilters } from "@/lib/services/nxt-her-schedule";

interface InteractiveScheduleClientProps {
  initialData: ScheduleData;
}

export function InteractiveScheduleClient({ initialData }: InteractiveScheduleClientProps) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmarkToggle = async (sessionId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/nxt-her/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle bookmark");
      }

      const result = await response.json();
      
      // Update the data state
      setData(prevData => ({
        ...prevData,
        sessions: prevData.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, isBookmarked: result.isBookmarked }
            : session
        ),
      }));

      toast.success(result.message);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = useCallback(async (filters: ScheduleFilters) => {
    setIsLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.days && filters.days.length > 0) {
        params.set("days", filters.days.join(","));
      }
      
      if (filters.tracks && filters.tracks.length > 0) {
        params.set("tracks", filters.tracks.join(","));
      }
      
      if (filters.pillars && filters.pillars.length > 0) {
        params.set("pillars", filters.pillars.join(","));
      }
      
      if (filters.sessionTypes && filters.sessionTypes.length > 0) {
        params.set("sessionTypes", filters.sessionTypes.join(","));
      }
      
      if (filters.speakers && filters.speakers.length > 0) {
        params.set("speakers", filters.speakers.join(","));
      }
      
      if (filters.attendanceType && filters.attendanceType !== "both") {
        params.set("attendanceType", filters.attendanceType);
      }
      
      if (filters.searchQuery && filters.searchQuery.trim()) {
        params.set("searchQuery", filters.searchQuery.trim());
      }

      const response = await fetch(`/api/nxt-her/schedule?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch filtered schedule");
      }

      const newData = await response.json();
      setData(newData);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <InteractiveSchedule 
      initialData={data}
      onBookmarkToggle={handleBookmarkToggle}
      onFiltersChange={handleFiltersChange}
    />
  );
}