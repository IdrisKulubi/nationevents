import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  jobSeekers, 
  attendanceRecords,
  checkpoints,
  events
} from "@/db/schema";
import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  Clock,
  MapPin,
  Activity,
  CheckCircle,
  TrendingUp,
  BarChart3,
  FileText
} from "lucide-react";
import { ExportButton } from "@/components/admin/export-button";

export default async function AttendanceReportsPage() {
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
              Please create an active event to generate attendance reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventId = activeEvent[0].id;
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get attendance data
  const [
    totalRegistered,
    totalCheckedIn,
    todayCheckedIn,
    checkpointBreakdown,
    hourlyDistribution,
    dailyTrend,
    verificationMethods,
    recentActivity
  ] = await Promise.all([
    // Total registered
    db.select({ count: count() })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "approved")),
    
    // Total checked in
    db.select({ count: count() })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.eventId, eventId)),
    
    // Today's check-ins
    db.select({ count: count() })
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.eventId, eventId),
        gte(attendanceRecords.checkInTime, new Date(new Date().setHours(0, 0, 0, 0)))
      )),
    
    // Checkpoint breakdown
    db.select({
      checkpointName: checkpoints.name,
      count: count()
    })
      .from(attendanceRecords)
      .leftJoin(checkpoints, eq(attendanceRecords.checkpointId, checkpoints.id))
      .where(eq(attendanceRecords.eventId, eventId))
      .groupBy(checkpoints.name)
      .orderBy(desc(count())),
    
    // Hourly distribution
    db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`,
      count: count()
    })
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.eventId, eventId),
        gte(attendanceRecords.checkInTime, last7Days)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`),
    
    // Daily trend (last 7 days)
    db.select({
      date: sql<string>`DATE(${attendanceRecords.checkInTime})`,
      count: count()
    })
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.eventId, eventId),
        gte(attendanceRecords.checkInTime, last7Days)
      ))
      .groupBy(sql`DATE(${attendanceRecords.checkInTime})`)
      .orderBy(sql`DATE(${attendanceRecords.checkInTime})`),
    
    // Verification methods
    db.select({
      method: attendanceRecords.verificationMethod,
      count: count()
    })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.eventId, eventId))
      .groupBy(attendanceRecords.verificationMethod)
      .orderBy(desc(count())),
    
    // Recent activity
    db.select({
      id: attendanceRecords.id,
      checkInTime: attendanceRecords.checkInTime,
      verificationMethod: attendanceRecords.verificationMethod,
      jobSeekerName: users.name,
      checkpointName: checkpoints.name
    })
      .from(attendanceRecords)
      .leftJoin(jobSeekers, eq(attendanceRecords.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .leftJoin(checkpoints, eq(attendanceRecords.checkpointId, checkpoints.id))
      .where(eq(attendanceRecords.eventId, eventId))
      .orderBy(desc(attendanceRecords.checkInTime))
      .limit(10)
  ]);

  const attendanceRate = totalRegistered[0]?.count > 0 
    ? Math.round((totalCheckedIn[0]?.count || 0) / totalRegistered[0].count * 100) 
    : 0;

  const peakHour = hourlyDistribution.reduce((max, current) => 
    current.count > max.count ? current : max, 
    { hour: 0, count: 0 }
  );

  const exportData = {
    eventName: activeEvent[0].name,
    totalRegistered: totalRegistered[0]?.count || 0,
    totalCheckedIn: totalCheckedIn[0]?.count || 0,
    todayCheckedIn: todayCheckedIn[0]?.count || 0,
    attendanceRate,
    peakHour: peakHour.hour,
    checkpointBreakdown,
    hourlyDistribution,
    dailyTrend,
    verificationMethods
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Attendance Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Comprehensive attendance analytics for {activeEvent[0].name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton 
              data={exportData}
              filename={`attendance-report-${new Date().toISOString().split('T')[0]}.json`}
              label="Export Data"
            />
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 Days
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Registered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(totalRegistered[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Job seekers registered
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Total Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(totalCheckedIn[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-green-100 text-sm mt-1">
                Since event start
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendanceRate}%</div>
              <div className="w-full bg-purple-400/30 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Peak Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {peakHour.hour}:00
              </div>
              <p className="text-orange-100 text-sm mt-1">
                {peakHour.count} check-ins
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checkpoint Breakdown */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Checkpoint Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkpointBreakdown.map((item, index) => {
                const total = totalCheckedIn[0]?.count || 1;
                const percentage = Math.round((item.count / total) * 100);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.checkpointName || 'Unknown Checkpoint'}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.count.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500 ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Verification Methods */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Verification Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationMethods.map((item, index) => {
                const total = totalCheckedIn[0]?.count || 1;
                const percentage = Math.round((item.count / total) * 100);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {item.method?.replace('_', ' ') || 'Unknown Method'}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.count.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500 ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Hourly Distribution Chart */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Hourly Check-in Distribution (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2 h-40 items-end">
              {Array.from({ length: 24 }, (_, hour) => {
                const data = hourlyDistribution.find(item => item.hour === hour);
                const count = data?.count || 0;
                const maxCount = Math.max(...hourlyDistribution.map(h => h.count)) || 1;
                const height = (count / maxCount) * 100;
                
                return (
                  <div key={hour} className="flex flex-col items-center group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t hover:from-blue-600 hover:to-purple-700 transition-all duration-200 relative"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '2px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count} check-ins
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {hour}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {activity.jobSeekerName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {activity.jobSeekerName || 'Unknown User'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {activity.checkpointName || 'Unknown Checkpoint'} • {activity.verificationMethod?.replace('_', ' ') || 'Unknown Method'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(activity.checkInTime).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 