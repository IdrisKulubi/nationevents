import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import { TimeBatchManagement } from "@/components/admin/time-batch-management";

export default async function TimeBatchesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userProfile = await getUserProfile(session.user.id!);
  
  // Check if user has admin role
  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <TimeBatchManagement />;
} 