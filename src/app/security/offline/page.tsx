import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, securityPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OfflineVerificationInterface } from "@/components/security/offline-verification";

export default async function OfflineVerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user info
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || (user[0].role !== "security" && user[0].role !== "admin")) {
    redirect("/dashboard");
  }

  const currentUser = user[0];
  const isAdmin = currentUser.role === "admin";

  // Get security personnel profile (only for security role users)
  let securityProfile = null;
  if (!isAdmin) {
    const profile = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.userId, session.user.id))
      .limit(1);

    if (!profile[0]) {
      redirect("/security/setup");
    }
    securityProfile = profile[0];
  }

  // For admin users, create mock security data
  const securityId = securityProfile?.id || `admin-${currentUser.id}`;
  const badgeNumber = securityProfile?.badgeNumber || `ADMIN-${currentUser.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Offline Verification
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser.name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Offline Mode
              </span>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Administrator
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <OfflineVerificationInterface 
          securityId={securityId}
          badgeNumber={badgeNumber}
        />
      </main>
    </div>
  );
} 