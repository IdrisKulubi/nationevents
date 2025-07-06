import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, jobSeekers, employers } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { UsersClientPage } from "./client-page";
import { ErrorBoundary } from "@/components/shared/error-boundary";

async function getUsersData() {
  // Get user statistics
  const userStats = await db
    .select({
      role: users.role,
      count: count(),
      active: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
      inactive: sql<number>`COUNT(CASE WHEN ${users.isActive} = false THEN 1 END)`,
    })
    .from(users)
    .groupBy(users.role);

  // Get recent users
  const recentUsers = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
      employer: employers,
    })
    .from(users)
    .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
    .leftJoin(employers, eq(employers.userId, users.id))
    .orderBy(desc(users.createdAt))
    .limit(20);

  // Get all users with detailed info
  const allUsers = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
      employer: employers,
    })
    .from(users)
    .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
    .leftJoin(employers, eq(employers.userId, users.id))
    .orderBy(desc(users.lastActive));

  return { userStats, recentUsers, allUsers };
}

export default async function AdminUsersPage() {
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

  const { userStats, recentUsers, allUsers } = await getUsersData();

  return (
    <ErrorBoundary>
      <UsersClientPage initialData={{ userStats, allUsers }} />
    </ErrorBoundary>
  );
} 