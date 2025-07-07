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
    
    // The middleware now guarantees that a session and a user exist.
    // It also guarantees that the user has the 'employer' or 'admin' role.
    const userId = session!.user!.id;
    const userRole = session!.user!.role;

    // If an employer has not completed their profile, redirect to the setup page.
    // Admins are allowed to proceed without an employer profile.
    if (userRole === 'employer' && !session?.user?.profileCompleted) {
      redirect('/employer/setup');
    }

    // Fetch the employer profile. The middleware ensures this will exist for employers.
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, userId))
      .limit(1);

    // Fetch user details for mock data if needed
    const userRecord = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // If an admin is viewing the page without an employer profile, we can create a mock.
    // For actual employers, employerProfile[0] is guaranteed to exist by the check above.
    const employer = employerProfile[0] || {
      id: "admin_mock_employer",
      userId: userId,
      companyName: "Admin Portal Access",
      contactPerson: userRecord[0]?.name ?? "Admin",
      contactEmail: userRecord[0]?.email ?? "admin@system.com",
      // ... (add other necessary mock properties)
    };

    // Get current active event (most recent active event)
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.startDate))
      .limit(1);

    // Get recent candidate interactions
    const recentInteractions = employerProfile.length > 0 ? await db
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
    const shortlistsCount = employerProfile.length > 0 ? await db
      .select({ count: count() })
      .from(shortlists)
      .where(eq(shortlists.employerId, employer.id)) : [{ count: 0 }];

    // Get total interactions (views)
    const totalInteractions = employerProfile.length > 0 ? await db
      .select({ count: count() })
      .from(candidateInteractions)
      .where(eq(candidateInteractions.employerId, employer.id)) : [{ count: 0 }];

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Admin Notice (only shown for admin users) */}
          {userRole === "admin" && !employerProfile[0] && (
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