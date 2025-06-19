import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, securityPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Shield, Home, WifiOff } from "lucide-react";

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has security role or admin role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || (user[0].role !== "security" && user[0].role !== "admin")) {
    redirect("/dashboard");
  }

  // For admin users, skip the security personnel profile requirement
  if (user[0].role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-900">
                  Security Dashboard
                </h1>
                
                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-4">
                  <Link 
                    href="/security" 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/security/offline" 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <WifiOff className="h-4 w-4" />
                    Offline Mode
                  </Link>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user[0].name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    );
  }

  // For security personnel, check if profile exists
  const securityProfile = await db
    .select()
    .from(securityPersonnel)
    .where(eq(securityPersonnel.userId, session.user.id))
    .limit(1);

  if (!securityProfile[0]) {
    redirect("/security/setup");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Security Dashboard
              </h1>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-4">
                <Link 
                  href="/security" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/security/offline" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <WifiOff className="h-4 w-4" />
                  Offline Mode
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user[0].name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Security Personnel
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 