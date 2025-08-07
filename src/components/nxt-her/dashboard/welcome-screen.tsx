import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { DashboardData } from "@/lib/services/nxt-her-dashboard";

interface WelcomeScreenProps {
  data: DashboardData;
}

export function WelcomeScreen({ data }: WelcomeScreenProps) {
  const { attendee, event } = data;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAttendanceTypeColor = (type: string) => {
    return type === "in_person" 
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-purple-100 text-purple-800 border-purple-200";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isEventActive = () => {
    const now = new Date();
    return now >= event.startDate && now <= event.endDate;
  };

  const getEventStatus = () => {
    const now = new Date();
    if (now < event.startDate) {
      const daysUntil = Math.ceil((event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { status: "upcoming", message: `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` };
    } else if (now > event.endDate) {
      return { status: "ended", message: "Event has ended" };
    } else {
      return { status: "active", message: "Event is live now!" };
    }
  };

  const eventStatus = getEventStatus();

  return (
    <div className="space-y-6">
      {/* Personal Welcome Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-200">
                <AvatarImage 
                  src={attendee.profilePhotoUrl || undefined} 
                  alt={`${attendee.firstName} ${attendee.lastName}`}
                />
                <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                  {getInitials(attendee.firstName, attendee.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back, {attendee.firstName}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {attendee.jobTitle && attendee.organization 
                    ? `${attendee.jobTitle} at ${attendee.organization}`
                    : attendee.organization || "Ready to connect and learn"
                  }
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge className={getStatusColor(attendee.registrationStatus)}>
                {attendee.registrationStatus === "approved" ? "✓ Registered" : 
                 attendee.registrationStatus === "pending" ? "⏳ Pending" : "❌ Rejected"}
              </Badge>
              <Badge className={getAttendanceTypeColor(attendee.attendanceType)}>
                {attendee.attendanceType === "in_person" ? "🏢 In Person" : "💻 Virtual"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="mt-1">
                {event.description}
              </CardDescription>
            </div>
            <Badge 
              className={
                eventStatus.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                eventStatus.status === "upcoming" ? "bg-blue-100 text-blue-800 border-blue-200" :
                "bg-gray-100 text-gray-800 border-gray-200"
              }
            >
              {eventStatus.message}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(event.startDate, "MMM d")} - {format(event.endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{event.venue || "Virtual Event"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {isEventActive() ? "Live Now" : 
                 eventStatus.status === "upcoming" ? "Starting Soon" : "Completed"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to the features you need most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/nxt-her/agenda">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">My Agenda</span>
                <span className="text-xs text-gray-500">View schedule</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium">Networking</span>
              <span className="text-xs text-gray-500">Find connections</span>
            </Button>
            
            <Link href="/nxt-her/schedule">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Sessions</span>
                <span className="text-xs text-gray-500">Browse all</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Forums</span>
              <span className="text-xs text-gray-500">Join discussions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}