import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmployerSetupForm } from "@/components/employer/employer-setup-form";
import db from "@/db/drizzle";
import { users, employers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function EmployerSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const fromCompanyOnboard = params.from === "company-onboard";

  // Get current user from database to check their actual role
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser[0]) {
    redirect("/login");
  }

  const user = currentUser[0];

  // **THE CORE FIX**: If user is from the onboard flow and their role isn't 'employer' yet,
  // update the role in the database and then immediately redirect. This redirect forces
  // NextAuth to regenerate the session and JWT with the correct role.
  if (fromCompanyOnboard && user.role !== "employer") {
    console.log(`[AUTH_FLOW] Role mismatch for onboard. DB role: '${user.role}'. Updating to 'employer' and forcing redirect.`);
    await db
      .update(users)
      .set({ 
        role: "employer",
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));
    
    // Redirect to the same page, but without the query param. This re-runs the auth flow.
    redirect("/employer/setup");
  }

  // By the time the code reaches here, the user's session role should be correct.
  // Now, check if they already have an employer profile created.
  const existingEmployerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // If a profile exists, their setup is complete. Send to employer dashboard.
  if (existingEmployerProfile[0]) {
    console.log("[AUTH_FLOW] Employer profile exists. Redirecting to /employer.");
    redirect("/employer");
  }

  // If the user's role is not 'employer' (and they didn't just get updated),
  // they don't belong here. Redirect them to their correct dashboard.
  if (user.role !== "employer") {
    console.log(`[AUTH_FLOW] User with role '${user.role}' does not belong in employer setup. Redirecting.`);
    if (user.role === "admin") redirect("/admin");
    else if (user.role === "security") redirect("/security");
    else redirect("/dashboard");
  }

  // If all checks pass, render the setup form.
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