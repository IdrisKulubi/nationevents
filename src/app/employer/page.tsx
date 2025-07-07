import { auth } from "@/auth";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  shortlists,
  candidateInteractions,
  events,
  jobSeekers
} from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { CandidateActivity } from "@/components/employer/candidate-activity";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Eye } from "lucide-react";

// Force dynamic rendering since this page uses authentication and database queries
export const dynamic = 'force-dynamic';

export default async function EmployerDashboard() {
  try {
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

    if (!user[0]) {
      redirect("/login");
    }

    const currentUser = user[0];
    
    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    // If no employer profile and user is not admin, redirect to setup
    if (!employerProfile[0] && currentUser.role !== "admin") {
      console.log("No employer profile found for non-admin user, redirecting to setup");
      redirect("/employer/setup");
    }

    // For admin users without employer profile, create a mock employer
    const employer = employerProfile[0] || {
      id: "admin_mock_employer",
      userId: session.user.id,
      companyName: "Admin Portal Access",
      companyDescription: "Administrative access to employer features",
      industry: "administration",
      companySize: "enterprise" as const,
      website: null,
      logoUrl: null,
      address: null,
      contactPerson: currentUser.name,
      contactEmail: currentUser.email,
      contactPhone: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Get current active event (most recent active event)
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.startDate))
      .limit(1);

    // Get recent candidate interactions
    const recentInteractions = employerProfile[0] ? await db
      .select({
        interaction: candidateInteractions,
        jobSeeker: jobSeekers,
        user: users
      })
      .from(candidateInteractions)
      .leftJoin(jobSeekers, eq(jobSeekers.id, candidateInteractions.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(candidateInteractions.employerId, employer.id))
      .orderBy(desc(candidateInteractions.createdAt))
      .limit(5) : [];

    // Get shortlists count
    const shortlistsCount = employerProfile[0] ? await db
      .select({ count: count() })
      .from(shortlists)
      .where(eq(shortlists.employerId, employer.id)) : [{ count: 0 }];

    // Get total interactions (views)
    const totalInteractions = employerProfile[0] ? await db
      .select({ count: count() })
      .from(candidateInteractions)
      .where(eq(candidateInteractions.employerId, employer.id)) : [{ count: 0 }];

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Admin Notice (only shown for admin users) */}
          {currentUser.role === "admin" && !employerProfile[0] && (
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
              <p className="font-bold">Admin Access Mode</p>
              <p>You&apos;re viewing the employer portal as an administrator.</p>
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome, {employer.companyName}!
            </h1>
            <p className="text-slate-600 text-lg">
              {activeEvent[0] ? `Discover top talent at ${activeEvent[0].name}.` : 'Discover top talent for your company.'}
            </p>
                  </div>
          
          {/* Main Action Callout */}
          <div className="bg-blue-600 text-white rounded-xl p-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Start Discovering Candidates</h2>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Our candidate pool is at your fingertips. Browse profiles, use powerful filters to find specific skills, and connect with your next great hire.
            </p>
            <Link href="/employer/candidates">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-bold">
                Browse All Candidates <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stats Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Dashboard at a Glance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-slate-600">Shortlisted Candidates</span>
                  </div>
                  <span className="font-bold text-slate-800 text-lg">{shortlistsCount[0]?.count || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-slate-600">Candidate Profiles Viewed</span>
                    </div>
                  <span className="font-bold text-slate-800 text-lg">{totalInteractions[0]?.count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Candidate Activity</h3>
              <CandidateActivity 
                interactions={recentInteractions}
                employerId={employer.id}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in employer dashboard:", error);
    redirect("/error");
  }
} 