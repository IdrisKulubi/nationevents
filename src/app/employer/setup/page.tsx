import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmployerSetupForm } from "@/components/employer/employer-setup-form";
import db from "@/db/drizzle";
import { users, employers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function EmployerSetupPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // The new auth flow via `/api/auth/onboard` ensures the session role is correct.
  // We can now trust the session and redirect if the role is not 'employer'.
  if (session.user.role !== 'employer') {
    console.log(`[AUTH_FLOW] Non-employer with role '${session.user.role}' accessed /employer/setup. Redirecting to dashboard.`);
    redirect("/dashboard");
  }

  // Check if an employer profile already exists for this user.
  const existingEmployerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // If a profile already exists, their setup is complete. Send to the main employer dashboard.
  if (existingEmployerProfile[0]) {
    console.log("[AUTH_FLOW] Employer profile already exists. Redirecting to /employer.");
    redirect("/employer");
  }

  // Fetch the user's details to pre-fill the form.
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  });

  if (!user) {
    // This is an unlikely edge case, but we redirect to login if the user is not found.
    redirect("/login?error=UserNotFoundInSetup");
  }

  // If all checks pass, render the setup form. The page is now much simpler.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome! Complete Your Company Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your company profile to start participating in the career summit.
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <EmployerSetupForm 
            userId={session.user.id} 
            userName={user.name} 
            userEmail={user.email}
          />
        </div>
      </div>
    </div>
  );
} 