"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, User, Briefcase, GraduationCap, Clock, CheckCircle, ArrowRight, ArrowLeft, Shield, FileText } from "lucide-react";
import { createJobSeekerProfile } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { CVUploadField } from "./cv-upload-field";
import { AdditionalDocumentsUpload } from "./additional-documents-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

// Job sectors/categories from employer side
const JOB_SECTORS = [
  "Technology & Engineering",
  "Software Development",
  "Telecommunications",
  "Data Science & Analytics",
  "Cybersecurity",
  "Cloud Computing",
  "AI & Machine Learning",
  "Marketing & Sales",
  "Admin & Translator",
  "Project Management",
  "Human Resources",
  "Finance & Accounting",
  "Operations",
  "Customer Service",
  "Civil Engineering",
  "Quality Assurance",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Design & Creative",
  "Healthcare",
  "Education & Training",
  "Other"
];

const EDUCATION_LEVELS = [
  "High School",
  "Diploma/Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
  "Other"
];

const EXPERIENCE_LEVELS = [
  "Fresh Graduate",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years"
];

const HUAWEI_CERTIFICATION_LEVELS = [
  "HCIA",
  "HCIP", 
  "HCIE",
];

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must be less than 500 characters"),
  jobSectors: z.array(z.string()).min(1, "Please select at least one job sector"),
  educationLevel: z.string().min(1, "Please select your education level"),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  skills: z.string().optional(),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid portfolio URL").optional().or(z.literal("")),
  expectedSalary: z.string().optional(),
  availableFrom: z.string().min(1, "Please select when you're available to start"),
  // Huawei student fields
  isHuaweiStudent: z.boolean(),
  huaweiCertificationLevel: z.string().optional(),
  huaweiCertificationDetails: z.string().optional(),
  // Conference fields
  wantsToAttendConference: z.boolean(),
  conferenceSessionInterests: z.array(z.string()).optional(),
  conferenceDietaryRequirements: z.string().optional(),
  conferenceAccessibilityNeeds: z.string().optional(),
  // Data privacy acceptance
  dataPrivacyAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the data privacy policy to continue"
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  existingProfile?: any;
}

interface AdditionalDocument {
  id: string;
  name: string;
  url: string;
  uploadKey: string;
  uploadedAt: string;
  fileSize?: number;
  fileType?: string;
}

export function ProfileSetupForm({ user, existingProfile }: ProfileSetupFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string>("");
  const [additionalDocuments, setAdditionalDocuments] = useState<AdditionalDocument[]>([]);
  const [conferenceSessionInterests, setConferenceSessionInterests] = useState<string[]>([]);
  const [dataPrivacyAccepted, setDataPrivacyAccepted] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    
    defaultValues: {
      fullName: user.name || "",
      jobSectors: [],
      isHuaweiStudent: false,
      wantsToAttendConference: false,
      conferenceSessionInterests: [],
      dataPrivacyAccepted: false,
    },
    mode: "onChange"
  });

  const toggleSector = (sector: string) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSectors);
    setValue("jobSectors", newSectors);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["fullName", "phoneNumber"];
        break;
      case 2:
        fieldsToValidate = ["bio", "jobSectors"];
        break;
      case 3:
        fieldsToValidate = ["educationLevel", "experienceLevel"];
        break;
      case 4:
        // Step 4 has required fields but they're handled by conditional validation
        fieldsToValidate = ["availableFrom", "dataPrivacyAccepted"];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    
    // Additional validation for step 3 - ensure CV is uploaded
    if (currentStep === 3 && !cvUploadUrl) {
      toast.error("Please upload your CV before proceeding to the next step");
      return;
    }
    
    // Additional validation for step 4 - ensure data privacy is accepted
    if (currentStep === 4 && !dataPrivacyAccepted) {
      toast.error("Please accept the data privacy policy to complete your profile");
      return;
    }
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Prevent any accidental form submissions on steps 1-3
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      toast.info(`Please use the "Next Step" button to continue. You're on step ${currentStep} of ${totalSteps}.`);
      return;
    }
    // Only proceed with actual submission on step 4
    onSubmit(e as React.FormEvent<HTMLFormElement>);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    
    // Only allow submission on step 4 (final step)
    if (currentStep !== totalSteps) {
      console.log(`🚫 Form submission blocked - currently on step ${currentStep}, need to be on step ${totalSteps}`);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    // Get form values using watch
    const formValues = watch();
    
    if (!cvUploadUrl) {
      toast.error("Please upload your CV before submitting");
      return;
    }

    // Check if profile already exists to prevent duplicate submissions
    if (existingProfile?.jobSeeker?.id && existingProfile?.jobSeeker?.cvUrl) {
      console.log("Profile already exists and is complete, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const skillsArray = formValues.skills?.split(",").map(skill => skill.trim()).filter(Boolean) || [];
      
      const profileData = {
        userId: user.id!,
        fullName: formValues.fullName,
        phoneNumber: formValues.phoneNumber,
        bio: formValues.bio,
        interestCategories: selectedSectors,
        educationLevel: formValues.educationLevel,
        experienceLevel: formValues.experienceLevel,
        skills: skillsArray,
        linkedinUrl: formValues.linkedinUrl || "",
        portfolioUrl: formValues.portfolioUrl || "",
        expectedSalary: formValues.expectedSalary || "",
        availableFrom: formValues.availableFrom,
        cvUrl: cvUploadUrl,
        cvUploadKey: cvUploadUrl,
        additionalDocuments: additionalDocuments,
        jobSectors: selectedSectors,
        isHuaweiStudent: formValues.isHuaweiStudent || false,
        huaweiCertificationLevel: formValues.huaweiCertificationLevel || "",
        huaweiCertificationDetails: formValues.huaweiCertificationDetails || "",
        wantsToAttendConference: formValues.wantsToAttendConference || false,
        conferenceSessionInterests: conferenceSessionInterests,
        conferenceDietaryRequirements: formValues.conferenceDietaryRequirements || "",
        conferenceAccessibilityNeeds: formValues.conferenceAccessibilityNeeds || "",
        dataPrivacyAccepted: formValues.dataPrivacyAccepted,
        dataPrivacyAcceptedAt: new Date(),
      };

      // Debug: Log the data being sent
      console.log("🔍 Frontend sending profile data:", {
        skills: profileData.skills,
        expectedSalary: profileData.expectedSalary,
        skillsType: typeof profileData.skills,
        expectedSalaryType: typeof profileData.expectedSalary,
        hasExistingProfile: !!existingProfile?.jobSeeker?.id,
      });

      await createJobSeekerProfile(profileData);
      
      toast.success("Registration completed! Our team will review your application and match you with suitable companies. You'll receive notifications with your interview schedule and booth assignment details for the Nation-Huawei Leap Job Fair.");
      
      // Force a hard refresh to ensure session is updated
      console.log("Profile creation successful, forcing page refresh to update session");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Profile creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Handle specific error cases
      if (errorMessage.includes("already exists")) {
        toast.error("Profile already exists. Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-t-4 border-t-green-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Step 1: Your Profile</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Introduce yourself to employers</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="e.g., Jane Doe"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg"><AlertCircle className="w-4 h-4" />{errors.fullName.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="e.g., 0712 345 678"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg"><AlertCircle className="w-4 h-4" />{errors.phoneNumber.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-t-4 border-t-orange-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold">Step 2: Career Interests</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Tell us about your professional goals</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-medium">Your Professional Story *</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Share a brief summary of your career journey, your key strengths, and what you're looking for in your next role. Think of this as your personal introduction to employers."
                  className="mt-1 min-h-[120px] bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">
                    {watch("bio")?.length || 0}/500 characters
                  </p>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    (watch("bio")?.length || 0) >= 50 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300'
                  }`}>
                    {(watch("bio")?.length || 0) >= 50 ? '✓ Good length' : 'Minimum 50 characters'}
                  </div>
                </div>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Which job areas are you interested in? * (Select at least one)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {JOB_SECTORS.map((sector, index) => (
                    <Badge
                      key={sector}
                      variant={selectedSectors.includes(sector) ? "default" : "outline"}
                      className={`cursor-pointer p-3 text-center justify-center transition-all duration-200 hover:scale-105 ${
                        selectedSectors.includes(sector)
                          ? `bg-gradient-to-r ${
                              index % 4 === 0 ? 'from-blue-500 to-indigo-600' :
                              index % 4 === 1 ? 'from-green-500 to-emerald-600' :
                              index % 4 === 2 ? 'from-purple-500 to-violet-600' :
                              'from-orange-500 to-red-500'
                            } text-white shadow-lg border-0`
                          : "hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600"
                      }`}
                      onClick={() => toggleSector(sector)}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
                {selectedSectors.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {selectedSectors.length} sector{selectedSectors.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                {errors.jobSectors && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jobSectors.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-t-4 border-t-purple-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Step 3: Background & Skills</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Share your qualifications and upload your CV</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel" className="text-slate-700 dark:text-slate-300 font-medium">Highest Level of Education *</Label>
                  <Select onValueChange={(value) => setValue("educationLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="e.g., Bachelor's Degree, Diploma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School / Secondary School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor&apos;s Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master&apos;s Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Vocational/Technical">Vocational/Technical Certificate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.educationLevel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {errors.educationLevel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="text-slate-700 dark:text-slate-300 font-medium">Years of Professional Experience *</Label>
                  <Select onValueChange={(value) => setValue("experienceLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="e.g., 1-3 years, 5+ years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No Experience">No Experience / Student</SelectItem>
                      <SelectItem value="0-1 years">0 - 1 year</SelectItem>
                      <SelectItem value="1-3 years">1 - 3 years</SelectItem>
                      <SelectItem value="3-5 years">3 - 5 years</SelectItem>
                      <SelectItem value="5-10 years">5 - 10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experienceLevel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {errors.experienceLevel.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-slate-700 dark:text-slate-300 font-medium">Your Top Skills (Optional)</Label>
                <Input
                  id="skills"
                  {...register("skills")}
                  placeholder="e.g., Customer Service, Sales, Data Entry, Teamwork"
                  className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                />
                <p className="text-sm text-slate-500 bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg">
                  💡 Tip: Separate each skill with a comma ( , ). List both technical and soft skills.
                </p>
                {errors.skills && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.skills.message}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                <CVUploadField
                  onFileSelect={setCvFile}
                  onUploadComplete={setCvUploadUrl}
                  currentFile={cvFile}
                />
                {!cvUploadUrl && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Please upload your CV to continue
                  </p>
                )}
              </div>

              {/* Additional Documents Upload */}
              <div className="space-y-2">
                <AdditionalDocumentsUpload
                  onDocumentsChange={setAdditionalDocuments}
                  currentDocuments={additionalDocuments}
                  maxDocuments={5}
                />
              </div>

              {/* Assignment Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Almost Done!</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Great progress! Next, you&apos;ll share your Huawei student status and conference preferences, plus your availability details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-t-4 border-t-pink-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-semibold">Step 4: Huawei ICT Academy and Conference</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Share your Huawei student and conference information</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="isHuaweiStudent" className="text-slate-700 dark:text-slate-300 font-medium">Did you join the Huawei ICT Academy? *</Label>
                <Select onValueChange={(value) => setValue("isHuaweiStudent", value === "true")}>
                  <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20">
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isHuaweiStudent && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.isHuaweiStudent.message}
                  </p>
                )}
              </div>

              {watch("isHuaweiStudent") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="huaweiCertificationLevel" className="text-slate-700 dark:text-slate-300 font-medium">Huawei Certification Level (Optional)</Label>
                    <Select onValueChange={(value) => setValue("huaweiCertificationLevel", value)}>
                      <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20">
                        <SelectValue placeholder="Select your certification level" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUAWEI_CERTIFICATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.huaweiCertificationLevel && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.huaweiCertificationLevel.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="huaweiCertificationDetails" className="text-slate-700 dark:text-slate-300 font-medium">Huawei Certification Details (Optional)</Label>
                    <Textarea
                      id="huaweiCertificationDetails"
                      {...register("huaweiCertificationDetails")}
                      placeholder="Enter any additional details about your Huawei certification"
                      className="mt-1 min-h-[120px] bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-200 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="wantsToAttendConference" className="text-slate-700 dark:text-slate-300 font-medium">Do you want to attend the conference? *</Label>
                <Select onValueChange={(value) => setValue("wantsToAttendConference", value === "true")}>
                  <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20">
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.wantsToAttendConference && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.wantsToAttendConference.message}
                  </p>
                )}
              </div>

              {watch("wantsToAttendConference") && (
                <>
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Conference Session Interests (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Technology & Innovation",
                        "Career Development", 
                        "Networking Sessions",
                        "Industry Insights",
                        "Skills Development",
                        "Leadership & Management",
                        "Entrepreneurship",
                        "Digital Transformation"
                      ].map((interest, index) => (
                        <Badge
                          key={interest}
                          variant={conferenceSessionInterests.includes(interest) ? "default" : "outline"}
                          className={`cursor-pointer p-3 text-center justify-center transition-all duration-200 hover:scale-105 ${
                            conferenceSessionInterests.includes(interest)
                              ? `bg-gradient-to-r ${
                                  index % 4 === 0 ? 'from-pink-500 to-rose-600' :
                                  index % 4 === 1 ? 'from-purple-500 to-indigo-600' :
                                  index % 4 === 2 ? 'from-blue-500 to-cyan-600' :
                                  'from-green-500 to-emerald-600'
                                } text-white shadow-lg border-0`
                              : "hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600"
                          }`}
                          onClick={() => {
                            const newInterests = conferenceSessionInterests.includes(interest)
                              ? conferenceSessionInterests.filter(i => i !== interest)
                              : [...conferenceSessionInterests, interest];
                            setConferenceSessionInterests(newInterests);
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    {conferenceSessionInterests.length > 0 && (
                      <div className="bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg">
                        <p className="text-sm text-pink-700 dark:text-pink-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {conferenceSessionInterests.length} session{conferenceSessionInterests.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>

                 

                 
                </>
              )}

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-pink-600" />
                  Your Availability & Links
                </h4>
              
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-slate-700 dark:text-slate-300 font-medium">When can you start a new job? *</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      {...register("availableFrom")}
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-200"
                    />
                    {errors.availableFrom && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.availableFrom.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary" className="text-slate-700 dark:text-slate-300 font-medium">Expected Monthly Salary (Optional)</Label>
                    <Input
                      id="expectedSalary"
                      {...register("expectedSalary")}
                      placeholder="e.g., KES 50,000"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-slate-700 dark:text-slate-300 font-medium">Your LinkedIn Profile Link (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-200"
                    />
                     {errors.linkedinUrl && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.linkedinUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl" className="text-slate-700 dark:text-slate-300 font-medium">Link to Your Work or Portfolio (Optional)</Label>
                    <Input
                      id="portfolioUrl"
                      {...register("portfolioUrl")}
                      placeholder="https://your-portfolio-website.com"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Data Privacy Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          Data Privacy & Consent
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Please review and accept our data privacy policy
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                          <p className="font-medium">Data Collection & Retention Policy:</p>
                          <ul className="space-y-1 ml-4 list-disc text-xs">
                            <li>We collect your personal and professional information to facilitate job matching and interview coordination</li>
                            <li>Your data will be shared with participating employers and event organizers for recruitment purposes</li>
                            <li>All data will be securely stored and retained for <strong>1 (one) year</strong> from the date of collection</li>
                            <li>After 1 year, your data will be permanently deleted from our systems unless you explicitly request otherwise</li>
                            <li>You have the right to request access, correction, or deletion of your data at any time</li>
                            <li>Your CV and documents will be accessible to employers during the job fair and matching process</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                      <Checkbox
                        id="dataPrivacyAccepted"
                        checked={dataPrivacyAccepted}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setDataPrivacyAccepted(isChecked);
                          setValue("dataPrivacyAccepted", isChecked);
                        }}
                        className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="dataPrivacyAccepted" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed"
                        >
                          I acknowledge and accept the data privacy policy outlined above *
                        </Label>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          By checking this box, you consent to the collection, processing, and storage of your personal data for recruitment purposes for a period of 1 year.
                        </p>
                      </div>
                    </div>

                    {errors.dataPrivacyAccepted && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {errors.dataPrivacyAccepted.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Notice */}
                <div className="bg-gradient-to-r from-pink-50 to-pink-950/20 p-4 rounded-xl border border-pink-200/50 dark:border-pink-800/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-pink-900 dark:text-pink-100 mb-1">What Happens Next?</h5>
                      <p className="text-sm text-pink-700 dark:text-pink-300">
                        Once you submit your profile, our team will carefully review it. We will then match you with suitable companies and assign you an interview time. 
                        You&apos;ll receive an email and SMS with all the details. Good luck!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Complete Your Profile
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">Progress</span>
            <span className="font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 h-3 rounded-full opacity-80" 
                 style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center mt-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
              {step < 5 && (
                <div className={`w-full h-1 mx-2 transition-all duration-300 ${
                  step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div 
        className="space-y-8"
        onKeyDown={(e) => {
          // Prevent Enter key submission on steps 1-3
          if (e.key === 'Enter' && currentStep < totalSteps) {
            e.preventDefault();
            nextStep();
          }
        }}
      >
     
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep < totalSteps) {
                toast.info(`Please use the "Next Step" button to continue to step ${currentStep + 1}.`);
              }
            }}
          >
            {renderStep()}
          </form>

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8 py-3 h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="space-y-2">
              <form onSubmit={handleFormSubmit}>
                <Button
                  type="submit"
                  disabled={isSubmitting || !cvUploadUrl || !dataPrivacyAccepted}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              </form>
              
              {/* Helper text for disabled button */}
              {(!cvUploadUrl || !dataPrivacyAccepted) && !isSubmitting && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    {!cvUploadUrl && !dataPrivacyAccepted 
                      ? "Please upload your CV and accept the data privacy policy to continue"
                      : !cvUploadUrl 
                      ? "Please upload your CV to continue"
                      : "Please accept the data privacy policy to continue"
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 