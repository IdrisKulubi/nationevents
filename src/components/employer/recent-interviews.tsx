"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Star, MessageSquare, Award } from "lucide-react";

interface InterviewData {
  slot: {
    id: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
  };
  booking: {
    id: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
    feedback: string | null;
    rating: number | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface RecentInterviewsProps {
  interviews: InterviewData[];
  employerId: string;
}

export function RecentInterviews({ interviews, employerId }: RecentInterviewsProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "completed":
        return {
          className: "bg-green-100 text-green-800 border-2 border-green-300",
          icon: "✅",
          label: "Completed"
        };
      case "confirmed":
        return {
          className: "bg-blue-100 text-blue-800 border-2 border-blue-300",
          icon: "🔵",
          label: "Confirmed"
        };
      case "scheduled":
        return {
          className: "bg-yellow-100 text-yellow-800 border-2 border-yellow-300",
          icon: "📅",
          label: "Scheduled"
        };
      case "cancelled":
        return {
          className: "bg-red-100 text-red-800 border-2 border-red-300",
          icon: "❌",
          label: "Cancelled"
        };
      case "no_show":
        return {
          className: "bg-orange-100 text-orange-800 border-2 border-orange-300",
          icon: "⚠️",
          label: "No Show"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-2 border-gray-300",
          icon: "⏳",
          label: "Available"
        };
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? "text-yellow-500 fill-yellow-500" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🎯 Recent Interviews
              </CardTitle>
              <p className="text-base text-gray-700 mt-1 font-medium">
                Latest interview activities and outcomes
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border-2 border-green-300 shadow-sm">
            <span className="text-sm font-bold text-green-700">
              {interviews.length} Recent
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No recent interviews
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              Interview history will appear here once you start conducting interviews.
            </p>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              Schedule First Interview
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {interviews.map((interview) => {
              const statusConfig = getStatusConfig(interview.booking?.status);
              return (
                <div
                  key={interview.slot.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-300 bg-white shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header with Time and Status */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span className="text-lg font-bold text-green-900">
                            {formatTime(interview.slot.startTime)} - {formatTime(interview.slot.endTime)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${statusConfig.className} font-bold px-3 py-1`}
                        >
                          {statusConfig.icon} {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Candidate Info */}
                      {interview.user && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 mb-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-700" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">
                                {interview.user.name}
                              </h4>
                              <p className="text-sm text-gray-600">{interview.user.email}</p>
                            </div>
                          </div>

                          {/* Rating and Feedback */}
                          {interview.booking?.rating && (
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                <span className="font-bold text-gray-900">Interview Rating:</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {renderStars(interview.booking.rating)}
                                </div>
                                <span className="text-sm font-bold text-gray-700">
                                  ({interview.booking.rating}/5)
                                </span>
                              </div>
                            </div>
                          )}

                          {interview.booking?.feedback && (
                            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                <span className="font-bold text-blue-900">Interview Feedback</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {interview.booking.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interview Notes */}
                      {interview.slot.notes && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">📝</span>
                            </div>
                            <div>
                              <p className="font-bold text-yellow-900 mb-1">Interview Notes</p>
                              <p className="text-sm text-yellow-800">
                                {interview.slot.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 ml-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-2 border-green-300 text-green-700 hover:bg-green-50 font-semibold rounded-xl whitespace-nowrap"
                      >
                        📋 View Details
                      </Button>
                      {interview.booking?.status === "completed" && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl whitespace-nowrap"
                        >
                          📊 View Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* View All Button */}
            <div className="text-center pt-6 border-t-2 border-green-100">
              <Button 
                variant="outline"
                className="border-2 border-green-300 text-green-700 hover:bg-green-50 font-bold px-8 py-3 rounded-xl"
              >
                📅 View All Interview History
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 