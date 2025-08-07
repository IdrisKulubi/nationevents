"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PersonalizedAgenda } from "@/components/nxt-her/dashboard/personalized-agenda";
import type { PersonalizedAgenda as PersonalizedAgendaType } from "@/lib/services/nxt-her-agenda";

interface PersonalizedAgendaClientProps {
  agenda: PersonalizedAgendaType;
}

export function PersonalizedAgendaClient({ agenda: initialAgenda }: PersonalizedAgendaClientProps) {
  const [agenda, setAgenda] = useState(initialAgenda);
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
      
      // Update the agenda state
      setAgenda(prevAgenda => {
        const updatedSessions = prevAgenda.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, isBookmarked: result.isBookmarked }
            : session
        );

        const updatedBookmarkedSessions = updatedSessions.filter(s => s.isBookmarked);
        const updatedRecommendedSessions = updatedSessions
          .filter(s => s.relevanceScore > 0.5 && !s.isBookmarked)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 10);

        return {
          ...prevAgenda,
          sessions: updatedSessions,
          bookmarkedSessions: updatedBookmarkedSessions,
          recommendedSessions: updatedRecommendedSessions,
          stats: {
            ...prevAgenda.stats,
            bookmarkedSessions: updatedBookmarkedSessions.length,
          },
        };
      });

      toast.success(result.message);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PersonalizedAgenda 
      agenda={agenda} 
      onBookmarkToggle={handleBookmarkToggle}
    />
  );
}