import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import { EmployerManagement } from "@/components/admin/employer-management";

export default async function EmployersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userProfile = await getUserProfile(session.user.id!);
  
  // Check if user has admin role
  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <EmployerManagement />;
} 