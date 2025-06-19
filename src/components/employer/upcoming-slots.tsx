"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Mail, Star } from "lucide-react";
import { format } from "date-fns";

interface SlotData {
  slot: {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    isBooked: boolean;
    interviewerName: string | null;
    notes: string | null;
  };
  booking: {
    id: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
    notes: string | null;
  } | null;
  jobSeeker: {
    id: string;
    bio: string | null;
    experience: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
  } | null;
}

interface UpcomingSlotsProps {
  slots: SlotData[];
  employerId: string;
}

export function UpcomingSlots({ slots, employerId }: UpcomingSlotsProps) {
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "confirmed":
        return {
          className: "bg-green-100 text-green-800 border-2 border-green-300",
          icon: "✅",
          label: "Confirmed"
        };
      case "scheduled":
        return {
          className: "bg-blue-100 text-blue-800 border-2 border-blue-300",
          icon: "📅",
          label: "Scheduled"
        };
      case "completed":
        return {
          className: "bg-gray-100 text-gray-800 border-2 border-gray-300",
          icon: "✔️",
          label: "Completed"
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

  return (
    <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📅 Today&apos;s Interview Schedule
              </CardTitle>
              <p className="text-base text-gray-700 mt-1 font-medium">
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'} scheduled • {slots.filter(s => s.booking).length} booked
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border-2 border-blue-300 shadow-sm">
            <span className="text-base font-bold text-blue-700">
              {format(new Date(), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {slots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No interviews scheduled for today
            </h3>
            <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
              Your schedule is clear. Great time to review candidates or plan for tomorrow!
            </p>
            <div className="space-y-3">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Create Interview Slots
              </Button>
              <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl">
                View All Slots
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {slots.map((slotData) => {
              const statusConfig = getStatusConfig(slotData.booking?.status);
              return (
                <div
                  key={slotData.slot.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-300 bg-white shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Time and Status Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-lg font-bold text-blue-900">
                            {format(slotData.slot.startTime, 'HH:mm')} - {format(slotData.slot.endTime, 'HH:mm')}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${statusConfig.className} font-bold px-3 py-1 text-sm`}
                        >
                          {statusConfig.icon} {statusConfig.label}
                        </Badge>
                        <div className="bg-gray-100 px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            {slotData.slot.duration} min
                          </span>
                        </div>
                      </div>

                      {/* Candidate Information */}
                      {slotData.user && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 mb-4 border border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-green-700" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">
                                    {slotData.user.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">Interview Candidate</p>
                                </div>
                              </div>
                              <div className="space-y-2 ml-13">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{slotData.user.email}</span>
                                </div>
                                {slotData.user.phoneNumber && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{slotData.user.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {slotData.jobSeeker?.experience && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-purple-600" />
                                  <span className="font-bold text-gray-900">Experience</span>
                                </div>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 line-clamp-3">
                                  {slotData.jobSeeker.experience}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interviewer Notes */}
                      {slotData.slot.notes && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">📝</span>
                            </div>
                            <div>
                              <p className="font-bold text-yellow-900 mb-1">Interview Notes</p>
                              <p className="text-sm text-yellow-800">
                                {slotData.slot.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 ml-6">
                      {slotData.booking ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl whitespace-nowrap"
                          >
                            📋 View Details
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            🎥 Start Interview
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl whitespace-nowrap"
                        >
                          ⚙️ Configure Slot
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* View More Button */}
            <div className="text-center pt-6 border-t-2 border-blue-100">
              <Button 
                variant="outline"
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl"
              >
                📅 View All Interview Slots
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 