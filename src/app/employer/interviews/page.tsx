import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  booths, 
  interviewSlots, 
  interviewBookings, 
  jobSeekers,
  events 
} from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User, Settings, MapPin, Star, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, Eye, Filter, Search, BarChart3 } from "lucide-react";
import { InterviewSlotModal } from "@/components/employer/interview-slot-modal";
import { Input } from "@/components/ui/input";

export default async function EmployerInterviewsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user info to check role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const currentUser = user[0];
  
  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // For admin users without employer profile, create a mock employer
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get employer's booths
  const employerBooths = await db
    .select({
      booth: booths,
      event: events,
    })
    .from(booths)
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id));

  // Format booths for the modal
  const boothsForModal = employerBooths.map(item => ({
    id: item.booth.id,
    boothNumber: item.booth.boothNumber,
    location: item.booth.location,
    event: item.event ? {
      name: item.event.name,
      venue: item.event.venue
    } : undefined
  }));

  // Get interview slots
  const interviewSlotsData = employerBooths.length > 0 ? await db
    .select({
      slot: interviewSlots,
      booking: interviewBookings,
      jobSeeker: jobSeekers,
      user: users,
      booth: booths,
      event: events,
    })
    .from(interviewSlots)
    .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
    .leftJoin(jobSeekers, eq(jobSeekers.id, interviewBookings.jobSeekerId))
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id))
    .orderBy(desc(interviewSlots.startTime)) : [];

  // Separate upcoming and past interviews
  const upcomingInterviews = interviewSlotsData.filter(item => 
    item.slot.startTime >= today
  );
  const pastInterviews = interviewSlotsData.filter(item => 
    item.slot.startTime < today
  );

  const getStatusColor = (status?: string, isBooked?: boolean) => {
    if (!isBooked) return "bg-gray-100 text-gray-600 border-gray-300";
    
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status?: string, isBooked?: boolean) => {
    if (!isBooked) return <Clock className="h-3 w-3" />;
    
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />;
      case "completed":
        return <Star className="h-3 w-3" />;
      case "cancelled":
      case "no_show":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status?: string, isBooked?: boolean) => {
    if (!isBooked) return "Available 🕐";
    
    switch (status) {
      case "confirmed":
        return "Confirmed ✅";
      case "scheduled":
        return "Scheduled 📅";
      case "completed":
        return "Completed ⭐";
      case "cancelled":
        return "Cancelled ❌";
      case "no_show":
        return "No Show 😔";
      default:
        return status || "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    📅 Interview Management
                  </h1>
                  <p className="text-gray-700 text-lg font-medium mt-2">
                    Schedule, manage, and track your interview slots and candidate meetings
                  </p>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="🔍 Search interviews by candidate name or interviewer..."
                    className="pl-10 h-12 text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-white"
                  />
                </div>
                <Button variant="outline" className="h-12 px-6 border-2 border-gray-300 hover:bg-gray-50 rounded-xl">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <InterviewSlotModal booths={boothsForModal as any} />
              <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Admin Notice */}
        {currentUser.role === "admin" && !employerProfile[0] && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900">👑 Admin Mode Active</h3>
                <p className="text-orange-800 text-lg font-medium">
                  You&apos;re viewing interview management as an administrator with full access
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-900">{upcomingInterviews.length}</p>
                  <p className="text-blue-700 font-semibold">📅 Upcoming Slots</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-600">
                {upcomingInterviews.filter(i => new Date(i.slot.startTime).toDateString() === new Date().toDateString()).length} today
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-900">
                    {upcomingInterviews.filter(i => i.booking).length}
                  </p>
                  <p className="text-green-700 font-semibold">✅ Booked</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600">
                {Math.round((upcomingInterviews.filter(i => i.booking).length / Math.max(upcomingInterviews.length, 1)) * 100)}% booking rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-900">
                    {upcomingInterviews.filter(i => !i.booking).length}
                  </p>
                  <p className="text-yellow-700 font-semibold">🕐 Available</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
              <div className="mt-4 text-sm text-yellow-600">
                Ready for booking
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-900">{employerBooths.length}</p>
                  <p className="text-purple-700 font-semibold">🏢 Active Booths</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-700" />
                </div>
              </div>
              <div className="mt-4 text-sm text-purple-600">
                Across all events
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
                <Calendar className="h-6 w-6 text-blue-600" />
                🚀 Upcoming Interviews
              </CardTitle>
              <InterviewSlotModal 
                booths={boothsForModal as any}
                trigger={
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Slot
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Ready to Schedule Interviews?
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Create interview slots to start scheduling meetings with talented candidates and grow your team!
                </p>
                <InterviewSlotModal 
                  booths={boothsForModal as any}
                  trigger={
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
                      <Plus className="h-6 w-6 mr-3" />
                      🚀 Create Your First Interview Slot
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingInterviews.map((item) => (
                  <div
                    key={item.slot.id}
                    className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
                      item.booking 
                        ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" 
                        : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Time and Status */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                📅 {new Date(item.slot.startTime).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-blue-700 font-semibold">
                                ⏰ {new Date(item.slot.startTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} - {new Date(item.slot.endTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <Badge className={`px-4 py-2 font-bold border-2 ${getStatusColor(item.booking?.status || '', !!item.booking)}`}>
                            {getStatusIcon(item.booking?.status || '', !!item.booking)}
                            <span className="ml-2">{getStatusLabel(item.booking?.status || '', !!item.booking)}</span>
                          </Badge>
                          
                          {item.slot.duration && (
                            <Badge variant="outline" className="px-3 py-1 border-2 border-purple-300 text-purple-700 bg-purple-50">
                              ⚡ {item.slot.duration} min
                            </Badge>
                          )}
                        </div>

                        {/* Candidate Info */}
                        {item.user ? (
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                  {item.user.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">👤 {item.user.name}</h4>
                                <p className="text-gray-600">📧 {item.user.email}</p>
                              </div>
                              {item.booking?.rating && (
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Rating</p>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < (item.booking?.rating || 0)
                                            ? "text-yellow-500 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
                            <div className="flex items-center gap-3 text-gray-600">
                              <Clock className="h-5 w-5" />
                              <span className="font-medium">🎯 Waiting for candidate to book this slot</span>
                            </div>
                          </div>
                        )}

                        {/* Booth and Interviewer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.booth && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">📍 Booth {item.booth.boothNumber} - {item.booth.location}</span>
                              </div>
                            </div>
                          )}

                          {item.slot.interviewerName && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 text-gray-700">
                                <User className="h-4 w-4 text-green-600" />
                                <span className="font-medium">👨‍💼 {item.slot.interviewerName}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes and Feedback */}
                        {(item.slot.notes || item.booking?.feedback) && (
                          <div className="space-y-3">
                            {item.slot.notes && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-800 mb-2">📝 Interview Notes:</p>
                                <p className="text-blue-700">{item.slot.notes}</p>
                              </div>
                            )}
                            {item.booking?.feedback && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800 mb-2">💬 Feedback:</p>
                                <p className="text-green-700">{item.booking.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Slot
                        </Button>
                        
                        {item.booking ? (
                          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        ) : (
                          <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        )}
                        
                        <Button variant="outline" className="border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold rounded-xl">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Interviews */}
        {pastInterviews.length > 0 && (
          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Clock className="h-6 w-6 text-gray-600" />
                📋 Recent Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pastInterviews.slice(0, 5).map((item) => (
                  <div
                    key={item.slot.id}
                    className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-slate-50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Clock className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                📅 {new Date(item.slot.startTime).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600">
                                ⏰ {new Date(item.slot.startTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className={`px-4 py-2 font-bold border-2 ${getStatusColor(item.booking?.status || 'completed', !!item.booking)}`}>
                            {getStatusIcon(item.booking?.status || 'completed', !!item.booking)}
                            <span className="ml-2">{getStatusLabel(item.booking?.status || 'completed', !!item.booking)}</span>
                          </Badge>
                        </div>

                        {item.user && (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {item.user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-900">👤 {item.user.name}</span>
                              <p className="text-sm text-gray-600">📧 {item.user.email}</p>
                            </div>
                            {item.booking?.rating && (
                              <div className="ml-auto flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < (item.booking?.rating || 0)
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {item.booking?.feedback && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-3">
                            <p className="text-sm font-medium text-gray-800 mb-2">💬 Interview Feedback:</p>
                            <p className="text-gray-700">{item.booking.feedback}</p>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl ml-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {pastInterviews.length > 5 && (
                <div className="text-center mt-6">
                  <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl">
                    View All {pastInterviews.length} Past Interviews
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Booth Notice */}
        {employerBooths.length === 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-4">
                🏢 No Booth Configured
              </h3>
              <p className="text-yellow-800 mb-8 text-lg max-w-md mx-auto">
                You need to set up a booth before creating interview slots. A booth is your virtual space where interviews take place.
              </p>
              <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
                🚀 Setup Your First Booth
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 