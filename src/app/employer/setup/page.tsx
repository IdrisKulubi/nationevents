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

  // Check if employer profile already exists
  const existingEmployerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // If employer profile exists, redirect to employer dashboard
  if (existingEmployerProfile[0]) {
    console.log("Employer profile already exists, redirecting to employer dashboard");
    redirect("/employer");
  }

  // If user is coming from company onboard flow and doesn't have employer role, set it
  let roleWasUpdated = false;
  if (fromCompanyOnboard && user.role !== "employer") {
    console.log("Setting user role to employer for company onboard flow");
    await db
      .update(users)
      .set({ 
        role: "employer",
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));
    
    // Update the user object for the component
    user.role = "employer";
    roleWasUpdated = true;
  }

  // If user already has employer role but no profile, allow setup
  // If user has different role and not from company onboard, redirect to appropriate dashboard
  if (user.role !== "employer" && !fromCompanyOnboard) {
    console.log("User is not employer and not from company onboard, redirecting based on role");
    // Redirect based on user's actual role
    if (user.role === "admin") {
      redirect("/admin");
    } else if (user.role === "security") {
      redirect("/security");
    } else {
      redirect("/dashboard");
    }
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
            roleWasUpdated={roleWasUpdated}
          />
        </div>
      </div>
    </div>
  );
} 