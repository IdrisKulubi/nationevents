import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Users, Briefcase, FileText } from "lucide-react";
import { CVDownloadButton } from "@/components/cv-download-button";
import Image from "next/image";
import db from "@/db/drizzle";
import { employers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is coming from company onboard flow
  const params = await searchParams;
  const fromCompanyOnboard = params?.from === "company-onboard";
  const roleParam = params?.role;

  let userProfile;
  try {
    userProfile = await getUserProfile(session.user.id!);
  } catch (error) {
    console.error("Dashboard: Error fetching user profile:", error);
    // If we can't fetch profile, redirect to profile setup to be safe
    redirect("/profile-setup");
  }
  
  // If user is coming from company onboard, redirect to employer setup regardless of current role
  if (fromCompanyOnboard || roleParam === "employer") {
    redirect("/employer/setup?from=company-onboard");
  }
  
  // Handle different user roles
  if (userProfile?.role === "employer") {
    // Check if employer has completed their profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);
    
    if (!employerProfile[0]) {
      // Employer doesn't have a profile, redirect to setup
      redirect("/employer/setup");
    } else {
      // Employer has profile, redirect to employer dashboard
      redirect("/employer");
    }
  }
  
  if (userProfile?.role === "admin") {
    redirect("/admin");
  }
  
  if (userProfile?.role === "security") {
    redirect("/security");
  }
  
  // More robust profile completion check for job seekers
  // Check both profileComplete flag AND actual CV URL existence
  const hasCompleteProfile = userProfile?.profileComplete && userProfile?.jobSeeker?.cvUrl;
  
  if (!hasCompleteProfile) {
    console.log("Dashboard: User profile incomplete, redirecting to profile setup", {
      profileComplete: userProfile?.profileComplete,
      hasCvUrl: !!userProfile?.jobSeeker?.cvUrl,
      hasJobSeekerRecord: !!userProfile?.jobSeeker?.id,
      userId: session.user.id
    });
    
    // Add a small delay to allow any ongoing session updates to complete
    // This helps prevent redirect loops during profile creation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    redirect("/profile-setup");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/huawei-logo.png"
                alt="Huawei"
                className="h-10 object-contain"
                width={100}
                height={100}
              />
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
              <Image
                src="/nationlogo.png"
                alt="Nation Media Group"
                className="h-8 object-contain"
                width={100}
                height={100}
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                Welcome Back,
              </span>
              <br />
              <span className=" bg-clip-text text-red-500">
                {userProfile?.name}!
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-lg text-slate-600 dark:text-slate-300">
                Profile Setup Complete
              </span>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-700/50 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  Your Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Ticket Number
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300 font-mono tracking-wider">
                      {userProfile?.jobSeeker?.ticketNumber}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200">{userProfile?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Phone:</span>
                    <span className="text-slate-800 dark:text-slate-200">{userProfile?.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                    <Badge 
                      variant={userProfile?.jobSeeker?.registrationStatus === 'approved' ? 'default' : 'secondary'}
                      className={`${userProfile?.jobSeeker?.registrationStatus === 'approved' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                    >
                      {userProfile?.jobSeeker?.registrationStatus || 'pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/20 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">July 8th, 2025</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">One Day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">UON Graduation Square, Nairobi</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Registration: 8:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">50+ Companies</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">100+ Job Positions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Career Interests */}
          {userProfile?.jobSeeker?.interestCategories && (
            <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/20 hover:scale-[1.01]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  Your Career Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {userProfile?.jobSeeker.interestCategories.map((category: string, index: number) => (
                    <Badge 
                      key={category} 
                      variant="outline" 
                      className={`bg-gradient-to-r ${
                        index % 4 === 0 ? 'from-blue-50 to-blue-100 border-blue-200 text-blue-800 hover:from-blue-100 hover:to-blue-200' :
                        index % 4 === 1 ? 'from-green-50 to-green-100 border-green-200 text-green-800 hover:from-green-100 hover:to-green-200' :
                        index % 4 === 2 ? 'from-purple-50 to-purple-100 border-purple-200 text-purple-800 hover:from-purple-100 hover:to-purple-200' :
                        'from-orange-50 to-orange-100 border-orange-200 text-orange-800 hover:from-orange-100 hover:to-orange-200'
                      } dark:from-slate-800 dark:to-slate-700 dark:border-slate-600 dark:text-slate-200 px-4 py-2 font-medium transition-all duration-200 hover:scale-105`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-800 dark:to-slate-700/50 hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                Your Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProfile?.jobSeeker?.cvUrl && (
                  <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Curriculum Vitae</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Ready for employers to view</p>
                      </div>
                    </div>
                    <CVDownloadButton 
                      cvUrl={userProfile?.jobSeeker?.cvUrl} 
                      candidateName={userProfile?.name}
                    />
                  </div>
                )}
                
                {userProfile?.jobSeeker?.additionalDocuments && userProfile?.jobSeeker?.additionalDocuments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Additional Documents</h4>
                    {userProfile?.jobSeeker?.additionalDocuments.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{doc.type}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{doc.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Uploaded
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Looking forward to seeing you at the Nation-Huawei Career Summit!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
              <CheckCircle className="w-4 h-4" />
              <span>You&apos;re all set for the event</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 