"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Eye, Heart, Calendar, MessageCircle, User, Star, Clock } from "lucide-react";

interface InteractionData {
  interaction: {
    id: string;
    interactionType: "booth_visit" | "cv_viewed" | "contact_info_accessed" | "interview_scheduled" | "note_added" | "shortlisted";
    duration: number | null;
    notes: string | null;
    rating: number | null;
    createdAt: Date;
  };
  jobSeeker: {
    id: string;
    bio: string | null;
    experience: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface CandidateActivityProps {
  interactions: InteractionData[];
  employerId: string;
}

export function CandidateActivity({ interactions, employerId }: CandidateActivityProps) {
  const getInteractionConfig = (type: string) => {
    switch (type) {
      case "booth_visit":
        return {
          icon: <User className="h-5 w-5" />,
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          badgeClass: "bg-blue-100 text-blue-800 border-2 border-blue-300",
          label: "Booth Visit",
          emoji: "🏢"
        };
      case "cv_viewed":
        return {
          icon: <Eye className="h-5 w-5" />,
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
          badgeClass: "bg-green-100 text-green-800 border-2 border-green-300",
          label: "CV Viewed",
          emoji: "👁️"
        };
      case "contact_info_accessed":
        return {
          icon: <MessageCircle className="h-5 w-5" />,
          bgColor: "bg-purple-100",
          iconColor: "text-purple-600",
          badgeClass: "bg-purple-100 text-purple-800 border-2 border-purple-300",
          label: "Contact Accessed",
          emoji: "📞"
        };
      case "interview_scheduled":
        return {
          icon: <Calendar className="h-5 w-5" />,
          bgColor: "bg-orange-100",
          iconColor: "text-orange-600",
          badgeClass: "bg-orange-100 text-orange-800 border-2 border-orange-300",
          label: "Interview Scheduled",
          emoji: "📅"
        };
      case "note_added":
        return {
          icon: <MessageCircle className="h-5 w-5" />,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
          badgeClass: "bg-gray-100 text-gray-800 border-2 border-gray-300",
          label: "Note Added",
          emoji: "📝"
        };
      case "shortlisted":
        return {
          icon: <Heart className="h-5 w-5" />,
          bgColor: "bg-red-100",
          iconColor: "text-red-600",
          badgeClass: "bg-red-100 text-red-800 border-2 border-red-300",
          label: "Shortlisted",
          emoji: "⭐"
        };
      default:
        return {
          icon: <Activity className="h-5 w-5" />,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
          badgeClass: "bg-gray-100 text-gray-600 border-2 border-gray-300",
          label: "Activity",
          emoji: "📊"
        };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                ⚡ Candidate Activity
              </CardTitle>
              <p className="text-base text-gray-700 mt-1 font-medium">
                Real-time candidate interactions and engagement
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border-2 border-purple-300 shadow-sm">
            <span className="text-sm font-bold text-purple-700">
              {interactions.length} Activities
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {interactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No recent activity
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              Candidate interactions will appear here as they happen. Start engaging with candidates to see real-time activity.
            </p>
            <div className="space-y-3">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Browse Candidates
              </Button>
              <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl">
                View Analytics
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {interactions.map((interactionData) => {
              const config = getInteractionConfig(interactionData.interaction.interactionType);
              return (
                <div
                  key={interactionData.interaction.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-300 bg-white shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon and Type */}
                    <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <div className={config.iconColor}>
                        {config.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header with Badge and Time */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          variant="outline"
                          className={`${config.badgeClass} font-bold px-3 py-1 flex items-center gap-1`}
                        >
                          <span>{config.emoji}</span>
                          {config.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(interactionData.interaction.createdAt)}
                        </div>
                      </div>

                      {/* Candidate Information */}
                      {interactionData.user && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-3 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-indigo-700" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {interactionData.user.name}
                              </h4>
                              <p className="text-sm text-gray-600">{interactionData.user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      {interactionData.interaction.duration && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <div className="bg-blue-100 px-3 py-1 rounded-lg border border-blue-200">
                            <span className="text-blue-800 font-medium">
                              ⏱️ Duration: {interactionData.interaction.duration} minutes
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rating */}
                      {interactionData.interaction.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">
                              Rating: {interactionData.interaction.rating}/5
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {interactionData.interaction.notes && (
                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">💬</span>
                            </div>
                            <div>
                              <p className="font-bold text-indigo-900 mb-1">Notes</p>
                              <p className="text-sm text-indigo-800 leading-relaxed">
                                {interactionData.interaction.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl"
                      >
                        👁️ View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* View All Button */}
            <div className="text-center pt-6 border-t-2 border-purple-100">
              <Button 
                variant="outline"
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold px-8 py-3 rounded-xl"
              >
                📊 View All Activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 