import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  shortlists,
  candidateInteractions,
  jobSeekers
} from "@/db/schema";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Settings,
  Activity
} from "lucide-react";

export default async function EmployerAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const currentUser = user[0];
  
  const employerProfile = await db.select().from(employers).where(eq(employers.userId, session.user.id)).limit(1);

  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const analyticsPromises = employerProfile[0] ? [
    db.select({ count: count() }).from(candidateInteractions).where(eq(candidateInteractions.employerId, employer.id)),
    db.select({ count: count() }).from(candidateInteractions).where(and(eq(candidateInteractions.employerId, employer.id), gte(candidateInteractions.createdAt, lastWeek))),
    db.select({ count: count() }).from(shortlists).where(eq(shortlists.employerId, employer.id)),
    db.select({ count: count() }).from(shortlists).where(and(eq(shortlists.employerId, employer.id), gte(shortlists.createdAt, lastWeek))),
    db.select({ type: candidateInteractions.interactionType, count: count() }).from(candidateInteractions).where(eq(candidateInteractions.employerId, employer.id)).groupBy(candidateInteractions.interactionType),
    db.select({ date: sql`DATE(${candidateInteractions.createdAt})`, count: count() }).from(candidateInteractions).where(and(eq(candidateInteractions.employerId, employer.id), gte(candidateInteractions.createdAt, lastWeek))).groupBy(sql`DATE(${candidateInteractions.createdAt})`),
    db.select({ interaction: candidateInteractions, jobSeeker: jobSeekers, user: users }).from(candidateInteractions).leftJoin(jobSeekers, eq(jobSeekers.id, candidateInteractions.jobSeekerId)).leftJoin(users, eq(users.id, jobSeekers.userId)).where(eq(candidateInteractions.employerId, employer.id)).orderBy(desc(candidateInteractions.createdAt)).limit(10)
  ] : [
    Promise.resolve([{ count: 0 }]),
    Promise.resolve([{ count: 0 }]),
    Promise.resolve([{ count: 0 }]),
    Promise.resolve([{ count: 0 }]),
    Promise.resolve([]),
    Promise.resolve([]),
    Promise.resolve([])
  ];

  const [
    totalInteractions,
    weekInteractions,
    totalShortlists,
    weekShortlists,
    interactionTypes,
    dailyInteractions,
    recentInteractions
  ] = await Promise.all(analyticsPromises) as [
    { count: number }[], { count: number }[], { count: number }[], { count: number }[], any[], any[], any[]
  ];

  const getInteractionTypeLabel = (type?: string) => {
    if (!type) return "Unknown";
    const labels: { [key: string]: string } = {
      cv_viewed: "CV Views",
      contact_info_accessed: "Contact Views",
      note_added: "Notes Added",
      shortlisted: "Shortlisted"
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="text-gray-600 mt-2">
            Insights into your candidate engagement and shortlisting trends.
          </p>
        </div>
      </div>

      {currentUser.role === "admin" && !employerProfile[0] && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Settings className="h-6 w-6 text-orange-600" />
              <div>
              <h3 className="font-semibold text-orange-800">Admin Mode</h3>
              <p className="text-sm text-orange-700">Viewing analytics as an administrator. Data shown is for all employer activities.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Interactions</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalInteractions[0]?.count ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Interactions (Last 7 Days)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{weekInteractions[0]?.count ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Shortlists</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalShortlists[0]?.count ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Shortlists (Last 7 Days)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{weekShortlists[0]?.count ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Interaction Types</CardTitle></CardHeader>
          <CardContent>
            {interactionTypes.length > 0 ? interactionTypes.map((item: any) => (
              <div key={item.type} className="flex justify-between items-center mb-2">
                <span>{getInteractionTypeLabel(item.type)}</span>
                <span className="font-semibold">{item.count}</span>
                    </div>
            )) : <p>No interaction data yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Daily Activity (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            {/* Implement a simple bar chart or list here */}
            {dailyInteractions.length > 0 ? (
                <div className="space-y-2">
                    {dailyInteractions.map((item: any, index: number) => (
                        <div key={index} className="flex items-center">
                            <span className="w-24 text-sm text-gray-500">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                               <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(item.count / Math.max(...dailyInteractions.map((i: any) => i.count))) * 100}%` }}></div>
                            </div>
                            <span className="w-10 text-right text-sm font-semibold">{item.count}</span>
                  </div>
                    ))}
            </div>
            ) : <p>No activity in the last 7 days.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Interactions</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
            {recentInteractions.length > 0 ? recentInteractions.map((item: any) => (
              <div key={item.interaction.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.user.name}</p>
                  <p className="text-sm text-gray-500">{getInteractionTypeLabel(item.interaction.interactionType)}</p>
                </div>
                <span className="text-sm text-gray-500">{new Date(item.interaction.createdAt).toLocaleDateString()}</span>
              </div>
            )) : <p>No recent interactions.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 