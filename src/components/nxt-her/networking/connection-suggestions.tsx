"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Star, X, MessageCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { ConnectionRequestDialog } from "./connection-request-dialog";

interface ConnectionSuggestion {
  id: string;
  attendee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    organization?: string;
    profilePhotoUrl?: string;
  };
  matchScore: number;
  matchReasons: string[];
  status: "suggested" | "viewed" | "connected" | "dismissed";
}

interface ConnectionSuggestionsProps {
  onConnect?: (attendeeId: string) => void;
}

export function ConnectionSuggestions({ onConnect }: ConnectionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async (regenerate = false) => {
    try {
      if (regenerate) {
        setIsRegenerating(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(
        `/api/nxt-her/connection-suggestions${regenerate ? "?regenerate=true" : ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connection suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);

      if (regenerate && data.regenerated) {
        toast.success("Connection suggestions updated!");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to load connection suggestions");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: string) => {
    try {
      const response = await fetch("/api/nxt-her/connection-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ suggestionId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update suggestion status");
      }

      // Update local state
      setSuggestions(prev =>
        prev.map(suggestion =>
          suggestion.id === suggestionId
            ? { ...suggestion, status: status as any }
            : suggestion
        )
      );

      if (status === "dismissed") {
        toast.success("Suggestion dismissed");
      } else if (status === "viewed") {
        toast.success("Marked as viewed");
      }
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      toast.error("Failed to update suggestion");
    }
  };

  const handleConnectionSuccess = async (suggestionId: string) => {
    // Mark suggestion as connected
    await updateSuggestionStatus(suggestionId, "connected");
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-green-600 bg-green-50";
    if (score >= 0.5) return "text-blue-600 bg-blue-50";
    if (score >= 0.3) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return "Excellent Match";
    if (score >= 0.5) return "Good Match";
    if (score >= 0.3) return "Potential Match";
    return "Basic Match";
  };

  if (isLoading) {
    return <ConnectionSuggestionsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connection Suggestions
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your networking profile
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSuggestions(true)}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No suggestions available</h3>
            <p className="text-muted-foreground mb-4">
              Complete your networking profile to get personalized connection suggestions.
            </p>
            <Button variant="outline" onClick={() => fetchSuggestions(true)}>
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions
              .filter(s => s.status === "suggested")
              .map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={suggestion.attendee.profilePhotoUrl}
                      alt={`${suggestion.attendee.firstName} ${suggestion.attendee.lastName}`}
                    />
                    <AvatarFallback>
                      {suggestion.attendee.firstName[0]}
                      {suggestion.attendee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {suggestion.attendee.firstName} {suggestion.attendee.lastName}
                        </h4>
                        {(suggestion.attendee.jobTitle || suggestion.attendee.organization) && (
                          <p className="text-sm text-muted-foreground">
                            {suggestion.attendee.jobTitle}
                            {suggestion.attendee.jobTitle && suggestion.attendee.organization && " at "}
                            {suggestion.attendee.organization}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`${getScoreColor(suggestion.matchScore)} border-0`}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {Math.round(suggestion.matchScore * 100)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {getScoreLabel(suggestion.matchScore)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.matchReasons.slice(0, 3).map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                        {suggestion.matchReasons.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{suggestion.matchReasons.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ConnectionRequestDialog
                        attendee={suggestion.attendee}
                        onSuccess={() => handleConnectionSuccess(suggestion.id)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSuggestionStatus(suggestion.id, "viewed")}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Later
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSuggestionStatus(suggestion.id, "dismissed")}
                        className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {suggestions.filter(s => s.status === "suggested").length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You've reviewed all current suggestions.
                </p>
                <Button variant="outline" onClick={() => fetchSuggestions(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Get New Suggestions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionSuggestionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}