import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  jobSeekers, 
  employers
} from "@/db/schema";
import { eq, count, sql, desc, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Download,
  Users, 
  UserCheck,
  Building,
  TrendingUp,
  Calendar,
  Activity,
  Shield
} from "lucide-react";

export default async function UserAnalyticsPage() {
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

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get user analytics data
  const [
    totalUsers,
    newUsers30Days,
    roleDistribution,
    jobSeekerStats,
    employerStats,
    recentRegistrations
  ] = await Promise.all([
    // Total users
    db.select({ count: count() }).from(users),
    
    // New users last 30 days
    db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, last30Days)),
    
    // Role distribution
    db.select({
      role: users.role,
      count: count()
    })
      .from(users)
      .groupBy(users.role)
      .orderBy(desc(count())),
    
    // Job seeker stats
    db.select({
      status: jobSeekers.registrationStatus,
      count: count()
    })
      .from(jobSeekers)
      .groupBy(jobSeekers.registrationStatus)
      .orderBy(desc(count())),
    
    // Employer stats
    db.select({
      verified: employers.isVerified,
      count: count()
    })
      .from(employers)
      .groupBy(employers.isVerified)
      .orderBy(desc(count())),
    
    // Recent registrations
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10)
  ]);

  const totalCount = totalUsers[0]?.count || 0;
  const newCount30Days = newUsers30Days[0]?.count || 0;
  const growthRate = totalCount > 0 ? Math.round((newCount30Days / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              User Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Comprehensive user insights and registration analytics
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalCount.toLocaleString()}
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                New Users (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {newCount30Days.toLocaleString()}
              </div>
              <p className="text-green-100 text-sm mt-1">
                {growthRate}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Job Seekers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobSeekerStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
              </div>
              <p className="text-purple-100 text-sm mt-1">
                Total applicants
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Employers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {employerStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
              </div>
              <p className="text-orange-100 text-sm mt-1">
                Companies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Distribution */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleDistribution.map((item, index) => {
                const percentage = Math.round((item.count / totalCount) * 100);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {item.role}
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
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Job Seeker Stats */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Job Seeker Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobSeekerStats.map((item, index) => {
                const total = jobSeekerStats.reduce((sum, stat) => sum + stat.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {item.status?.replace('_', ' ') || 'Unknown'}
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
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Employer Stats */}
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Employer Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employerStats.map((item, index) => {
                const total = employerStats.reduce((sum, stat) => sum + stat.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const status = item.verified ? 'Verified' : 'Pending';
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {status}
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
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Registrations */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegistrations.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {user.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
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