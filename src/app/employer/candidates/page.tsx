import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  jobSeekers,
  candidateInteractions,
  shortlists
} from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { 
  Star,
} from "lucide-react";
import { ClientSideCandidateList } from './client-page';
import Link from "next/link";

export default async function EmployerCandidatesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const currentUser = user[0];
  
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  const candidatesData = await db
    .select({
      jobSeeker: jobSeekers,
      user: users,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .where(eq(users.role, 'job_seeker'))
    .orderBy(desc(jobSeekers.createdAt));

  const interactionCounts = employerProfile[0] ? await db
    .select({
      jobSeekerId: candidateInteractions.jobSeekerId,
      count: count(),
    })
    .from(candidateInteractions)
    .where(eq(candidateInteractions.employerId, employer.id))
    .groupBy(candidateInteractions.jobSeekerId) : [];
  const interactionMap = new Map(interactionCounts.map(ic => [ic.jobSeekerId, ic.count]));

  const shortlistedCandidates = employerProfile[0] ? await db
    .select({
      jobSeekerId: shortlists.jobSeekerId,
    })
    .from(shortlists)
    .where(eq(shortlists.employerId, employer.id)) : [];
  const shortlistedIds = new Set(shortlistedCandidates.map(s => s.jobSeekerId));

  const candidates = candidatesData.map((candidate) => {
    const isShortlisted = shortlistedIds.has(candidate.jobSeeker.id);
    const interactionCount = interactionMap.get(candidate.jobSeeker.id) || 0;
    
    return {
      jobSeeker: candidate.jobSeeker,
      user: candidate.user!,
      isShortlisted,
      interactionCount
    };
  });
                  
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Candidate Pool
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Browse, filter, and discover your next great hire.
            </p>
          </div>
          <Link href="/employer/shortlists">
            <Button variant="outline" className="dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600">
              <Star className="h-4 w-4 mr-2" />
              View Shortlists
            </Button>
          </Link>
        </div>
      </div>

      {currentUser.role === "admin" && !employerProfile[0] && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-600" role="alert">
          <p className="font-bold">Admin Access Mode</p>
          <p>You're viewing the candidate pool as an administrator.</p>
        </div>
      )}

      <ClientSideCandidateList candidates={candidates} employerId={employer.id} />
      
    </div>
  );
}