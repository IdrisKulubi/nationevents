import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { RolesClientPage } from "./client-page";

// Define role permissions
const rolePermissions = {
  admin: {
    name: "Administrator",
    description: "Full system access with all privileges",
    permissions: [
      "Manage Users", "Manage Events", "Manage Booths", "View Reports", 
      "System Settings", "Security Controls", "Data Export", "User Roles"
    ],
    color: "bg-purple-100 text-purple-800",
    level: 4
  },
  security: {
    name: "Security Personnel",
    description: "Access to security features and crowd control",
    permissions: [
      "Check Attendees", "Generate PINs", "Access Control", "Security Reports", 
      "Crowd Monitoring", "Incident Management"
    ],
    color: "bg-orange-100 text-orange-800",
    level: 3
  },
  employer: {
    name: "Employer",
    description: "Company representatives managing booths and jobs",
    permissions: [
      "Manage Company Profile", "Create Job Postings", "Manage Booths", 
      "Schedule Interviews", "View Candidates", "Company Reports"
    ],
    color: "bg-blue-100 text-blue-800",
    level: 2
  },
  job_seeker: {
    name: "Job Seeker",
    description: "Candidates looking for employment opportunities",
    permissions: [
      "View Jobs", "Apply to Positions", "Book Interviews", "Update Profile", 
      "View Event Schedule", "Access Career Resources"
    ],
    color: "bg-green-100 text-green-800",
    level: 1
  }
};

async function getRoleData() {
  // Get user counts by role
  const roleStats = await db
    .select({
      role: users.role,
      count: count(),
      active: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
      recent: sql<number>`COUNT(CASE WHEN ${users.createdAt} >= NOW() - INTERVAL '30 days' THEN 1 END)`,
    })
    .from(users)
    .groupBy(users.role);

  // Get all users with role information
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.lastActive));

  // Get recent role changes (simulated - you might track this in a separate table)
  const recentRoleChanges = await db
    .select()
    .from(users)
    .where(sql`${users.updatedAt} >= NOW() - INTERVAL '7 days'`)
    .orderBy(desc(users.updatedAt))
    .limit(10);

  return { roleStats, allUsers, recentRoleChanges };
}

export default async function AdminRoleManagementPage() {
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

  const { roleStats, allUsers, recentRoleChanges } = await getRoleData();

  return <RolesClientPage initialData={{ roleStats, allUsers, recentRoleChanges }} />;
} 