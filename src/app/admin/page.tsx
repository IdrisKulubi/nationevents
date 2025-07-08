import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // The middleware now guarantees that a session exists and the user is an admin.
  if (!session?.user) {
    // This redirect is a fallback, but should not be reached in normal operation.
    redirect("/login");
  }

  const userProfile = await getUserProfile(session.user.id!);
  
  return <AdminDashboardContent user={userProfile} />;
} 