import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  systemLogs,
  events,
  jobSeekers
} from "@/db/schema";
import { eq, count, sql, desc, gte, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Globe,
  HardDrive
} from "lucide-react";
import { ExportButton } from "@/components/admin/export-button";

export default async function SystemReportsPage() {
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

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get system metrics
  const [
    totalUsers,
    activeUsers24h,
    systemLogsCount,
    errorLogsCount,
    successfulActions,
    failedActions,
    usersByRole,
    recentLogs,
    dailyActivity,
    systemHealth,
    totalJobSeekers,
    huaweiStudents,
    conferenceAttendees,
    huaweiConferenceAttendees
  ] = await Promise.all([
    // Total users
    db.select({ count: count() }).from(users),
    
    // Active users in last 24h (users who have logs)
    db.select({ count: count() })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, last24Hours)),
    
    // System logs count
    db.select({ count: count() })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, last7Days)),
    
    // Error logs count
    db.select({ count: count() })
      .from(systemLogs)
      .where(and(
        gte(systemLogs.createdAt, last7Days),
        eq(systemLogs.success, false)
      )),
    
    // Successful actions
    db.select({ count: count() })
      .from(systemLogs)
      .where(and(
        gte(systemLogs.createdAt, last7Days),
        eq(systemLogs.success, true)
      )),
    
    // Failed actions
    db.select({ count: count() })
      .from(systemLogs)
      .where(and(
        gte(systemLogs.createdAt, last7Days),
        eq(systemLogs.success, false)
      )),
    
    // Users by role
    db.select({
      role: users.role,
      count: count()
    })
      .from(users)
      .groupBy(users.role)
      .orderBy(desc(count())),
    
    // Recent system logs
    db.select({
      id: systemLogs.id,
      action: systemLogs.action,
      resource: systemLogs.resource,
      success: systemLogs.success,
      createdAt: systemLogs.createdAt,
      userId: systemLogs.userId,
      userName: users.name
    })
      .from(systemLogs)
      .leftJoin(users, eq(users.id, systemLogs.userId))
      .orderBy(desc(systemLogs.createdAt))
      .limit(10),
    
    // Daily activity (last 7 days)
    db.select({
      date: sql<string>`DATE(${systemLogs.createdAt})`,
      count: count()
    })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, last7Days))
      .groupBy(sql`DATE(${systemLogs.createdAt})`)
      .orderBy(sql`DATE(${systemLogs.createdAt})`),
    
    // Mock system health data
    Promise.resolve({
      database: { status: 'healthy', responseTime: 45 },
      server: { status: 'healthy', uptime: '99.9%', load: 23 },
      storage: { status: 'healthy', usage: 67 },
      memory: { status: 'warning', usage: 85 },
      network: { status: 'healthy', latency: 12 }
    }),

    // Total job seekers
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId)),
    
    // Huawei students
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.isHuaweiStudent, true)),
    
    // Conference attendees
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.wantsToAttendConference, true)),
    
    // Huawei students attending conference
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(and(
        eq(jobSeekers.isHuaweiStudent, true),
        eq(jobSeekers.wantsToAttendConference, true)
      ))
  ]);

  // Calculate system metrics
  const systemReliability = systemLogsCount[0]?.count > 0 
    ? Math.round((successfulActions[0]?.count || 0) / systemLogsCount[0].count * 100) 
    : 100;

  const errorRate = systemLogsCount[0]?.count > 0 
    ? Math.round((errorLogsCount[0]?.count || 0) / systemLogsCount[0].count * 100) 
    : 0;

  // Export data
  const exportData = {
    generatedAt: new Date().toISOString(),
    systemMetrics: {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers24h: activeUsers24h[0]?.count || 0,
      systemLogsCount: systemLogsCount[0]?.count || 0,
      errorLogsCount: errorLogsCount[0]?.count || 0,
      systemReliability,
      errorRate,
      totalJobSeekers: totalJobSeekers[0]?.count || 0,
      huaweiStudents: huaweiStudents[0]?.count || 0,
      conferenceAttendees: conferenceAttendees[0]?.count || 0,
      huaweiConferenceAttendees: huaweiConferenceAttendees[0]?.count || 0,
    },
    usersByRole,
    recentLogs: recentLogs.slice(0, 20),
    dailyActivity,
    systemHealth
  };

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'healthy':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Activity };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_event':
      case 'update_event':
      case 'delete_event':
        return '📅';
      case 'create_user':
      case 'update_user':
        return '👤';
      case 'login':
      case 'logout':
        return '🔐';
      case 'create_booth':
      case 'update_booth':
        return '🏢';
      default:
        return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              System Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              System health, performance metrics, and operational insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton 
              data={exportData}
              filename={`system-report-${new Date().toISOString().split('T')[0]}.json`}
              label="Export Report"
            />
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-4 w-4 mr-2" />
              Last 7 Days
            </Badge>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(systemHealth).map(([component, data]) => {
            const healthStatus = getHealthStatus(data.status);
            const Icon = healthStatus.icon;
            
            return (
              <Card key={component} className={`border-0 shadow-xl ${healthStatus.bg} hover:shadow-2xl transition-all duration-300`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${healthStatus.color}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 capitalize">
                        {component}
                      </div>
                      <div className={`text-sm ${healthStatus.color} font-medium`}>
                        {data.status}
                      </div>
                    </div>
                  </div>
                 
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(totalUsers[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {activeUsers24h[0]?.count || 0} active (24h)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                System Reliability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemReliability}%
              </div>
              <p className="text-green-100 text-sm mt-1">
                {successfulActions[0]?.count || 0} successful actions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {errorRate}%
              </div>
              <p className="text-orange-100 text-sm mt-1">
                {errorLogsCount[0]?.count || 0} errors (7 days)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(systemLogsCount[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-purple-100 text-sm mt-1">
                Total actions (7 days)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Huawei Student & Conference Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Job Seekers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(totalJobSeekers[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-indigo-100 text-sm mt-1">
                Total registered
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
                Huawei Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(huaweiStudents[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-purple-100 text-sm mt-1">
                {totalJobSeekers[0]?.count > 0 
                  ? Math.round(((huaweiStudents[0]?.count || 0) / totalJobSeekers[0].count) * 100)
                  : 0}% of job seekers
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Conference Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(conferenceAttendees[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-emerald-100 text-sm mt-1">
                {totalJobSeekers[0]?.count > 0 
                  ? Math.round(((conferenceAttendees[0]?.count || 0) / totalJobSeekers[0].count) * 100)
                  : 0}% of job seekers
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Huawei + Conference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(huaweiConferenceAttendees[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-rose-100 text-sm mt-1">
                {huaweiStudents[0]?.count > 0 
                  ? Math.round(((huaweiConferenceAttendees[0]?.count || 0) / huaweiStudents[0].count) * 100)
                  : 0}% of Huawei students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Role Distribution and Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersByRole.map((role, index) => {
                const total = totalUsers[0]?.count || 1;
                const percentage = Math.round((role.count / total) * 100);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                        <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {role.role}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {role.count.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500 ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Daily Activity Chart */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Daily Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 h-40 items-end">
                {dailyActivity.map((day, index) => {
                  const maxCount = Math.max(...dailyActivity.map(d => d.count)) || 1;
                  const height = (day.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center group">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 relative"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.count} actions<br />
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

        {/* Recent System Logs */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log, index) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="text-2xl">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Badge 
                        variant={log.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {log.resource && `${log.resource} • `}
                      {log.userName || 'System'} • {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    log.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Load Average</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Response Time</span>
                  <span className="font-medium">45ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-green-600" />
                Storage & Memory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Storage</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Memory</span>
                    <span className="font-medium text-yellow-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Latency</span>
                  <span className="font-medium text-green-600">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Throughput</span>
                  <span className="font-medium">2.4 GB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Active Connections</span>
                  <span className="font-medium">1,247</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 