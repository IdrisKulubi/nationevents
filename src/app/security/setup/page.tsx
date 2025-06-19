import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, securityPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SecuritySetupForm } from "@/components/security/security-setup-form";

export default async function SecuritySetupPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has security role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "security") {
    redirect("/dashboard");
  }

  // Check if security personnel profile already exists
  const existingProfile = await db
    .select()
    .from(securityPersonnel)
    .where(eq(securityPersonnel.userId, session.user.id))
    .limit(1);

  if (existingProfile[0]) {
    redirect("/security");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Security Personnel Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your security profile to access the security dashboard
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <SecuritySetupForm userId={session.user.id} userName={user[0].name} />
        </div>
      </div>
    </div>
  );
} 