import { ProfileSetupForm } from "@/components/profile/profile-setup-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import Image from "next/image";

export default async function ProfileSetupPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user already has a profile with more robust validation
  const existingProfile = await getUserProfile(session.user.id!);
  
  // Only redirect if profile is truly complete (has both jobSeeker record AND CV)
  if (existingProfile?.profileComplete && existingProfile?.jobSeeker?.cvUrl) {
    console.log("Profile setup: User has complete profile, redirecting to dashboard", {
      profileComplete: existingProfile.profileComplete,
      hasCvUrl: !!existingProfile.jobSeeker?.cvUrl,
      hasJobSeekerRecord: !!existingProfile.jobSeeker?.id,
    });
    
    // Add a small delay to allow any ongoing session updates to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    redirect("/dashboard");
  }

  // If profile exists but is incomplete, allow them to complete it
  if (existingProfile?.jobSeeker?.id && !existingProfile?.jobSeeker?.cvUrl) {
    console.log("Profile setup: User has incomplete profile, allowing completion", {
      hasJobSeekerRecord: !!existingProfile.jobSeeker?.id,
      hasCvUrl: !!existingProfile.jobSeeker?.cvUrl,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                {existingProfile?.jobSeeker?.id ? "Complete Your" : "Complete Your"}
              </span>
              <br />
              <span className=" bg-clip-text text-red-500">
                Career Profile
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              {existingProfile?.jobSeeker?.id 
                ? "Finish setting up your profile to connect with top employers"
                : "Set up your profile to connect with top employers at the Huawei Career Summit"
              }
            </p>
          </div>

          {/* Profile Setup Form */}
          <ProfileSetupForm user={session.user} existingProfile={existingProfile} />
        </div>
      </div>
    </div>
  );
} 