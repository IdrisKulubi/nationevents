import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, jobSeekers } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { JobSeekersClientPage } from "./client-page";

async function getJobSeekersData() {
  // Get job seeker statistics
  const jobSeekerStats = await db
    .select({
      status: jobSeekers.registrationStatus,
      count: count(),
    })
    .from(jobSeekers)
    .groupBy(jobSeekers.registrationStatus);

  const safelyParseSkills = (seekers: any[]) => {
    return seekers.map((s) => {
      let skills: string[] = [];
      const jobSeeker = s.jobSeeker;
      if (jobSeeker && jobSeeker.skills) {
        if (typeof jobSeeker.skills === 'string') {
          try {
            const parsed = JSON.parse(jobSeeker.skills);
            if (Array.isArray(parsed)) {
              skills = parsed;
            }
          } catch (e) {
            console.warn(`Could not parse skills for jobSeeker ${jobSeeker.id}. Value was:`, jobSeeker.skills);
          }
        } else if (Array.isArray(jobSeeker.skills)) {
          skills = jobSeeker.skills as string[];
        }
      }
      return { ...s, jobSeeker: { ...jobSeeker, skills } };
    });
  };

  // Get all job seekers with user details
  const allJobSeekersRaw = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .orderBy(desc(jobSeekers.createdAt));
  const allJobSeekers = safelyParseSkills(allJobSeekersRaw);

  // Get recent registrations (last 7 days)
  const recentRegistrationsRaw = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .where(sql`${jobSeekers.createdAt} >= NOW() - INTERVAL '7 days'`)
    .orderBy(desc(jobSeekers.createdAt));
  const recentRegistrations = safelyParseSkills(recentRegistrationsRaw);

  // Get pending approvals
  const pendingApprovalsRaw = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .where(eq(jobSeekers.registrationStatus, "pending"))
    .orderBy(desc(jobSeekers.createdAt));
  const pendingApprovals = safelyParseSkills(pendingApprovalsRaw);

  return { jobSeekerStats, allJobSeekers, recentRegistrations, pendingApprovals };
}

export default async function AdminJobSeekersPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser[0] || currentUser[0].role !== "admin") {
    redirect("/dashboard");
  }

  const data = await getJobSeekersData();

  return <JobSeekersClientPage initialData={data} />;
} 