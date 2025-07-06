import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmployerSetupForm } from "@/components/employer/employer-setup-form";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
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

  // Get current user from database
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser[0]) {
    redirect("/login");
  }

  const user = currentUser[0];

  // If user is coming from company onboard flow and doesn't have employer role, set it
  if (fromCompanyOnboard && user.role !== "employer") {
    await db
      .update(users)
      .set({ 
        role: "employer",
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));
    
    // Update the user object for the component
    user.role = "employer";
  }

  // If user already has employer role but no profile, allow setup
  // If user has different role and not from company onboard, redirect
  if (user.role !== "employer" && !fromCompanyOnboard) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {fromCompanyOnboard ? "Welcome! Complete Your Company Profile" : "Company Setup"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {fromCompanyOnboard 
              ? "Set up your company profile to start participating in the career summit"
              : "Complete your company information to access the employer dashboard"
            }
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <EmployerSetupForm 
            userId={session.user.id} 
            userName={user.name} 
            userEmail={user.email}
            isFromCompanyOnboard={fromCompanyOnboard}
          />
        </div>
      </div>
    </div>
  );
} 