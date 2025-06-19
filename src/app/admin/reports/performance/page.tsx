import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  events,
  jobSeekers,
  employers,
  interviewSlots,
  interviewBookings,
  booths,
  shortlists,
  attendanceRecords
} from "@/db/schema";
import { eq, count, sql, desc, gte, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  Target,
  Users,
  Building,
  Calendar,
  Award,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { ExportButton } from "@/components/admin/export-button";

export default async function EventPerformancePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check admin access
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    redirect("/dashboard");
  }

  // Get current active event
  const activeEvent = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .limit(1);

  if (!activeEvent[0]) {
    return (
      <div className="p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              No Active Event
            </h3>
            <p className="text-yellow-800">
              Please create an active event to view performance reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventId = activeEvent[0].id;
  const eventStartDate = new Date(activeEvent[0].startDate);
  const today = new Date();

  // Get comprehensive performance data
  const [
    totalRegistrations,
    approvedRegistrations,
    totalEmployers,
    verifiedEmployers,
    totalBooths,
    activeBooths,
    totalInterviewSlots,
    bookedSlots,
    completedInterviews,
    totalShortlists,
    attendanceStats,
    conversionMetrics,
    topPerformingEmployers,
    dailyRegistrations,
    interviewCompletionRate
  ] = await Promise.all([
    // Total registrations
    db.select({ count: count() })
      .from(jobSeekers),
    
    // Approved registrations
    db.select({ count: count() })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "approved")),
    
    // Total employers
    db.select({ count: count() })
      .from(employers),
    
    // Verified employers
    db.select({ count: count() })
      .from(employers)
      .where(eq(employers.isVerified, true)),
    
    // Total booths
    db.select({ count: count() })
      .from(booths)
      .where(eq(booths.eventId, eventId)),
    
    // Active booths
    db.select({ count: count() })
      .from(booths)
      .where(and(
        eq(booths.eventId, eventId),
        eq(booths.isActive, true)
      )),
    
    // Total interview slots
    db.select({ count: count() })
      .from(interviewSlots)
      .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
      .where(eq(booths.eventId, eventId)),
    
    // Booked slots
    db.select({ count: count() })
      .from(interviewSlots)
      .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
      .where(and(
        eq(booths.eventId, eventId),
        eq(interviewSlots.isBooked, true)
      )),
    
    // Completed interviews
    db.select({ count: count() })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewSlots.id, interviewBookings.interviewSlotId))
      .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
      .where(and(
        eq(booths.eventId, eventId),
        eq(interviewBookings.status, "completed")
      )),
    
    // Total shortlists
    db.select({ count: count() })
      .from(shortlists),
    
    // Attendance stats
    db.select({ count: count() })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.eventId, eventId)),
    
    // Conversion metrics
    Promise.resolve({
      registrationToAttendance: 0,
      attendanceToInterview: 0,
      interviewToShortlist: 0
    }),
    
    // Top performing employers
    db.select({
      companyName: employers.companyName,
      interviewCount: count(interviewBookings.id),
      shortlistCount: sql<number>`COALESCE(COUNT(DISTINCT ${shortlists.id}), 0)`
    })
      .from(employers)
      .leftJoin(booths, eq(booths.employerId, employers.id))
      .leftJoin(interviewSlots, eq(interviewSlots.boothId, booths.id))
      .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(shortlists, eq(shortlists.employerId, employers.id))
      .where(eq(booths.eventId, eventId))
      .groupBy(employers.id, employers.companyName)
      .orderBy(desc(count(interviewBookings.id)))
      .limit(5),
    
    // Daily registrations trend (last 7 days)
    db.select({
      date: sql<string>`DATE(${jobSeekers.createdAt})`,
      count: count()
    })
      .from(jobSeekers)
      .where(gte(jobSeekers.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${jobSeekers.createdAt})`)
      .orderBy(sql`DATE(${jobSeekers.createdAt})`),
    
    // Interview completion rate
    Promise.resolve(0)
  ]);

  // Calculate key performance indicators
  const registrationApprovalRate = totalRegistrations[0]?.count > 0 
    ? Math.round((approvedRegistrations[0]?.count || 0) / totalRegistrations[0].count * 100) 
    : 0;

  const employerVerificationRate = totalEmployers[0]?.count > 0 
    ? Math.round((verifiedEmployers[0]?.count || 0) / totalEmployers[0].count * 100) 
    : 0;

  const boothUtilizationRate = totalBooths[0]?.count > 0 
    ? Math.round((activeBooths[0]?.count || 0) / totalBooths[0].count * 100) 
    : 0;

  const interviewBookingRate = totalInterviewSlots[0]?.count > 0 
    ? Math.round((bookedSlots[0]?.count || 0) / totalInterviewSlots[0].count * 100) 
    : 0;

  const interviewSuccessRate = bookedSlots[0]?.count > 0 
    ? Math.round((completedInterviews[0]?.count || 0) / bookedSlots[0].count * 100) 
    : 0;

  // Export data
  const exportData = {
    eventName: activeEvent[0].name,
    generatedAt: new Date().toISOString(),
    summary: {
      totalRegistrations: totalRegistrations[0]?.count || 0,
      approvedRegistrations: approvedRegistrations[0]?.count || 0,
      registrationApprovalRate,
      totalEmployers: totalEmployers[0]?.count || 0,
      verifiedEmployers: verifiedEmployers[0]?.count || 0,
      employerVerificationRate,
      totalBooths: totalBooths[0]?.count || 0,
      activeBooths: activeBooths[0]?.count || 0,
      boothUtilizationRate,
      totalInterviewSlots: totalInterviewSlots[0]?.count || 0,
      bookedSlots: bookedSlots[0]?.count || 0,
      interviewBookingRate,
      completedInterviews: completedInterviews[0]?.count || 0,
      interviewSuccessRate
    },
    topPerformingEmployers,
    dailyRegistrations
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-orange-900/20 dark:to-red-900/20">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Event Performance
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Comprehensive performance metrics for {activeEvent[0].name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton 
              data={exportData}
              filename={`event-performance-${new Date().toISOString().split('T')[0]}.json`}
              label="Export Report"
            />
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-2" />
              Overall Performance
            </Badge>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Registration Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {registrationApprovalRate}%
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {approvedRegistrations[0]?.count || 0} of {totalRegistrations[0]?.count || 0} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Employer Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {employerVerificationRate}%
              </div>
              <p className="text-green-100 text-sm mt-1">
                {verifiedEmployers[0]?.count || 0} verified employers
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Booth Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {boothUtilizationRate}%
              </div>
              <p className="text-purple-100 text-sm mt-1">
                {activeBooths[0]?.count || 0} of {totalBooths[0]?.count || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Interview Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {interviewSuccessRate}%
              </div>
              <p className="text-orange-100 text-sm mt-1">
                {completedInterviews[0]?.count || 0} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview Metrics */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Interview Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Slots Created</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {totalInterviewSlots[0]?.count || 0}
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Slots Booked</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {bookedSlots[0]?.count || 0} ({interviewBookingRate}%)
                  </span>
                </div>
                <Progress value={interviewBookingRate} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Interviews Completed</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {completedInterviews[0]?.count || 0} ({interviewSuccessRate}%)
                  </span>
                </div>
                <Progress value={interviewSuccessRate} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Shortlists</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {totalShortlists[0]?.count || 0}
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Registration Funnel */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Registration Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Applications</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {totalRegistrations[0]?.count || 0}
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Approved Applications</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {approvedRegistrations[0]?.count || 0} ({registrationApprovalRate}%)
                  </span>
                </div>
                <Progress value={registrationApprovalRate} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Event Attendance</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {attendanceStats[0]?.count || 0}
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Interview Participation</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {bookedSlots[0]?.count || 0}
                  </span>
                </div>
                <Progress value={interviewBookingRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Employers */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Top Performing Employers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingEmployers.map((employer, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {employer.companyName || 'Unknown Company'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {employer.interviewCount} interviews • {employer.shortlistCount} shortlists
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {employer.interviewCount + employer.shortlistCount}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Total Engagements
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Trend */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Registration Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 h-40 items-end">
              {dailyRegistrations.map((day, index) => {
                const maxCount = Math.max(...dailyRegistrations.map(d => d.count)) || 1;
                const height = (day.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center group">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-red-600 rounded-t hover:from-orange-600 hover:to-red-700 transition-all duration-200 relative"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.count} registrations<br />
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 