import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  booths, 
  interviewSlots, 
  interviewBookings, 
  shortlists,
  candidateInteractions,
  events,
  jobSeekers,
  jobs
} from "@/db/schema";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Calendar, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Settings,
  Download,
  Activity,
  Target,
  Clock
} from "lucide-react";

export default async function EmployerAnalyticsPage() {
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

  // Get date ranges
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get analytics data (will be empty for admin users without real employer profile)
  const analyticsPromises = employerProfile[0] ? [
    // Total interviews
    db.select({ count: count() })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .where(eq(booths.employerId, employer.id)),

    // This week interviews
    db.select({ count: count() })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .where(
        and(
          eq(booths.employerId, employer.id),
          gte(interviewBookings.createdAt, lastWeek)
        )
      ),

    // Total candidate interactions
    db.select({ count: count() })
      .from(candidateInteractions)
      .where(eq(candidateInteractions.employerId, employer.id)),

    // This week interactions
    db.select({ count: count() })
      .from(candidateInteractions)
      .where(
        and(
          eq(candidateInteractions.employerId, employer.id),
          gte(candidateInteractions.createdAt, lastWeek)
        )
      ),

    // Total shortlists
    db.select({ count: count() })
      .from(shortlists)
      .where(eq(shortlists.employerId, employer.id)),

    // This week shortlists
    db.select({ count: count() })
      .from(shortlists)
      .where(
        and(
          eq(shortlists.employerId, employer.id),
          gte(shortlists.createdAt, lastWeek)
        )
      ),

    // Interview status breakdown
    db.select({
      status: interviewBookings.status,
      count: count()
    })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .where(eq(booths.employerId, employer.id))
      .groupBy(interviewBookings.status),

    // Interaction types breakdown
    db.select({
      type: candidateInteractions.interactionType,
      count: count()
    })
      .from(candidateInteractions)
      .where(eq(candidateInteractions.employerId, employer.id))
      .groupBy(candidateInteractions.interactionType),

    // Daily interactions for the last 7 days
    db.select({
      date: sql`DATE(${candidateInteractions.createdAt})`,
      count: count()
    })
      .from(candidateInteractions)
      .where(
        and(
          eq(candidateInteractions.employerId, employer.id),
          gte(candidateInteractions.createdAt, lastWeek)
        )
      )
      .groupBy(sql`DATE(${candidateInteractions.createdAt})`),

    // Recent interactions
    db.select({
      interaction: candidateInteractions,
      jobSeeker: jobSeekers,
      user: users
    })
      .from(candidateInteractions)
      .leftJoin(jobSeekers, eq(jobSeekers.id, candidateInteractions.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(candidateInteractions.employerId, employer.id))
      .orderBy(desc(candidateInteractions.createdAt))
      .limit(10)

  ] : [
    // Default empty results for admin users without employer profiles
    Promise.resolve([{ count: 0 }]), // totalInterviews
    Promise.resolve([{ count: 0 }]), // weekInterviews
    Promise.resolve([{ count: 0 }]), // totalInteractions
    Promise.resolve([{ count: 0 }]), // weekInteractions
    Promise.resolve([{ count: 0 }]), // totalShortlists
    Promise.resolve([{ count: 0 }]), // weekShortlists
    Promise.resolve([]), // interviewStatuses
    Promise.resolve([]), // interactionTypes
    Promise.resolve([]), // dailyInteractions
    Promise.resolve([]) // recentInteractions - empty array instead of { count: 0 }
  ];

  const [
    totalInterviews,
    weekInterviews,
    totalInteractions,
    weekInteractions,
    totalShortlists,
    weekShortlists,
    interviewStatuses,
    interactionTypes,
    dailyInteractions,
    recentInteractions
  ] = await Promise.all(analyticsPromises) as [
    { count: number }[],
    { count: number }[],
    { count: number }[],
    { count: number }[],
    { count: number }[],
    { count: number }[],
    any[],
    any[],
    any[],
    any[]
  ];

  const getInteractionTypeLabel = (type?: string) => {
    if (!type) return "Unknown";
    switch (type) {
      case "booth_visit": return "Booth Visits";
      case "cv_viewed": return "CV Views";
      case "contact_info_accessed": return "Contact Views";
      case "interview_scheduled": return "Interview Scheduled";
      case "note_added": return "Note Added";
      case "shortlisted": return "Shortlisted";
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your recruitment performance and candidate engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last 7 days
          </Badge>
        </div>
      </div>

      {/* Admin Notice */}
      {currentUser.role === "admin" && !employerProfile[0] && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Admin Mode</h3>
                <p className="text-orange-800 text-sm">
                  You&apos;re viewing analytics as an administrator. Data will be limited to sample data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalInterviews[0]?.count || 0}
                </p>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-xs text-green-600 font-medium">
                  +{weekInterviews[0]?.count || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalInteractions[0]?.count || 0}
                </p>
                <p className="text-sm text-gray-600">Candidate Interactions</p>
                <p className="text-xs text-green-600 font-medium">
                  +{weekInteractions[0]?.count || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalShortlists[0]?.count || 0}
                </p>
                <p className="text-sm text-gray-600">Shortlisted</p>
                <p className="text-xs text-green-600 font-medium">
                  +{weekShortlists[0]?.count || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalInterviews[0]?.count > 0 ? 
                    Math.round((totalShortlists[0]?.count || 0) / totalInterviews[0].count * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xs text-gray-500">Shortlist to Interview</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Interview Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviewStatuses.length > 0 ? (
                interviewStatuses.map((status: any) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status.status)}>
                        {status.status || 'Pending'}
                      </Badge>
                    </div>
                    <span className="font-medium">{status.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No interview data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Interaction Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interactionTypes.length > 0 ? (
                interactionTypes.map((interaction: any) => (
                  <div key={interaction.type} className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {getInteractionTypeLabel(interaction.type)}
                    </span>
                    <span className="font-medium">{interaction.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No interaction data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentInteractions.length > 0 ? (
            <div className="space-y-4">
              {recentInteractions.map((item: any, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {item.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getInteractionTypeLabel(item.interaction?.interactionType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {item.interaction?.createdAt ? new Date(item.interaction.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.interaction?.createdAt ? new Date(item.interaction.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown Time'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray-600">
                Candidate interactions will appear here once you start engaging with job seekers
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Increase Visibility</h3>
              <p className="text-blue-800 text-sm mt-1">
                Engage with more candidate profiles to increase your reach
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Schedule More</h3>
              <p className="text-blue-800 text-sm mt-1">
                Create additional interview slots to meet more candidates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Review CVs</h3>
              <p className="text-blue-800 text-sm mt-1">
                Download and review candidate CVs to make better decisions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 