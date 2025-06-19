import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, employers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { 
  Building2, 
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  FileText, 
  Star, 
  Activity,
  Settings,
  Bell
} from "lucide-react";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has employer or admin role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || (user[0].role !== "employer" && user[0].role !== "admin")) {
    redirect("/dashboard");
  }

  // Check if employer profile exists (not required for admin)
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // If no employer profile and user is not admin, redirect to setup
  if (!employerProfile[0] && user[0].role !== "admin") {
    redirect("/employer/setup");
  }

  // For admin users without employer profile, create a mock employer object
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
    companyDescription: "Administrative access to employer features",
    industry: "administration",
    companySize: "enterprise" as const,
    website: null,
    logoUrl: null,
    address: null,
    contactPerson: user[0].name,
    contactEmail: user[0].email,
    contactPhone: null,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {employer.companyName}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {user[0].role === "admin" ? "Admin Dashboard" : "Employer Dashboard"}
                  </p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                <Link 
                  href="/employer" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/employer/booths" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Booths
                </Link>
                <Link 
                  href="/employer/interviews" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Interviews
                </Link>
                <Link 
                  href="/employer/candidates" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Candidates
                </Link>
                <Link 
                  href="/employer/shortlists" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Star className="h-4 w-4" />
                  Shortlists
                </Link>
                <Link 
                  href="/employer/analytics" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  Analytics
                </Link>
                {user[0].role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user[0].name}</p>
                  <p className="text-xs text-gray-500">
                    {user[0].role === "admin" ? "Administrator" : employer.industry || 'Employer'}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user[0].role === "admin" 
                    ? "bg-gradient-to-br from-orange-500 to-red-600" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}>
                  <span className="text-white text-sm font-medium">
                    {user[0].name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            <Link 
              href="/employer" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/employer/booths" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <MapPin className="h-4 w-4" />
              Booths
            </Link>
            <Link 
              href="/employer/interviews" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Calendar className="h-4 w-4" />
              Interviews
            </Link>
            <Link 
              href="/employer/candidates" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Users className="h-4 w-4" />
              Candidates
            </Link>
            <Link 
              href="/employer/shortlists" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Star className="h-4 w-4" />
              Shortlists
            </Link>
            {user[0].role === "admin" && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-md transition-colors whitespace-nowrap"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 