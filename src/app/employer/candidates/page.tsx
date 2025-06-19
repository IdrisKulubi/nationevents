import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  jobSeekers,
  candidateInteractions,
  shortlists,
  interviewBookings,
  jobs
} from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Eye, 
  Heart, 
  Calendar, 
  Mail, 
  Phone, 
  Settings,
  Star,
  Filter,
  UserCheck,
  Briefcase,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
  BarChart3
} from "lucide-react";
import { CandidateProfileModal } from "@/components/employer/candidate-profile-modal";
import { ShortlistModal } from "@/components/employer/shortlist-modal";
import { ContactButton } from "@/components/employer/contact-button";

export default async function EmployerCandidatesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user info to check role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const currentUser = user[0];
  
  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // For admin users without employer profile, create a mock employer
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  // Get all job seekers with their interactions
  const candidatesData = await db
    .select({
      jobSeeker: jobSeekers,
      user: users,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .orderBy(desc(jobSeekers.createdAt));

  // Get interaction counts for each candidate (for real employers)
  const interactionCounts = employerProfile[0] ? await db
    .select({
      jobSeekerId: candidateInteractions.jobSeekerId,
      count: count(),
    })
    .from(candidateInteractions)
    .where(eq(candidateInteractions.employerId, employer.id))
    .groupBy(candidateInteractions.jobSeekerId) : [];

  // Get shortlisted candidates (for real employers)
  const shortlistedCandidates = employerProfile[0] ? await db
    .select({
      jobSeekerId: shortlists.jobSeekerId,
    })
    .from(shortlists)
    .where(eq(shortlists.employerId, employer.id)) : [];

  const shortlistedIds = new Set(shortlistedCandidates.map(s => s.jobSeekerId));
  const interactionMap = new Map(interactionCounts.map(ic => [ic.jobSeekerId, ic.count]));

  // Calculate stats
  const totalCandidates = candidatesData.length;
  const totalShortlisted = shortlistedCandidates.length;
  const totalViewed = interactionCounts.length;
  const recentCandidates = candidatesData.filter(c => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return c.jobSeeker.createdAt >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    👥 Candidate Management
                  </h1>
                  <p className="text-gray-700 text-lg font-medium mt-2">
                    Discover, evaluate, and connect with top talent for your opportunities
                  </p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="🔍 Search candidates by name, skills, experience, or location..."
                  className="pl-12 h-12 text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl">
                <Filter className="h-5 w-5 mr-2" />
                Advanced Filters
              </Button>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Star className="h-5 w-5 mr-2" />
                View Shortlists
              </Button>
            </div>
          </div>
        </div>

        {/* Admin Notice */}
        {currentUser.role === "admin" && !employerProfile[0] && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900">👑 Admin Mode Active</h3>
                <p className="text-orange-800 text-lg font-medium">
                  You&apos;re viewing candidate management with full administrative access
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-900">{totalCandidates}</p>
                  <p className="text-blue-700 font-semibold">👥 Total Candidates</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">{recentCandidates} new this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-900">{totalShortlisted}</p>
                  <p className="text-yellow-700 font-semibold">⭐ Shortlisted</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Top talent saved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-900">{totalViewed}</p>
                  <p className="text-purple-700 font-semibold">👁️ Profiles Viewed</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600">Active engagement</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-900">0</p>
                  <p className="text-green-700 font-semibold">📅 Interviews</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Ready to schedule</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Row */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">🎯 Experience Level</label>
                <Select>
                  <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience Levels</SelectItem>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead/Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">💼 Skills & Tech</label>
                <Select>
                  <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="Any skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">📍 Location</label>
                <Select>
                  <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">⚡ Status</label>
                <Select>
                  <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="All candidates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Candidates</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="viewed">Recently Viewed</SelectItem>
                    <SelectItem value="new">New This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
              <Users className="h-6 w-6 text-blue-600" />
              🚀 All Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {candidatesData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 No candidates available yet
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Candidates will appear here once they register for events. Start promoting your opportunities!
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
                  <Zap className="h-6 w-6 mr-3" />
                  🚀 Promote Your Event
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {candidatesData.map((candidate) => {
                  const interactionCount = interactionMap.get(candidate.jobSeeker.id) || 0;
                  const isShortlisted = shortlistedIds.has(candidate.jobSeeker.id);
                  
                  // Format candidate data for modal
                  const candidateForModal = {
                    jobSeeker: {
                      ...candidate.jobSeeker,
                      bio: candidate.jobSeeker.bio || undefined,
                      experience: candidate.jobSeeker.experience || undefined,
                      skills: candidate.jobSeeker.skills || undefined,
                      education: candidate.jobSeeker.education || undefined,
                      portfolioUrl: candidate.jobSeeker.portfolioUrl || undefined,
                      linkedinUrl: candidate.jobSeeker.linkedinUrl || undefined,
                      cvUrl: candidate.jobSeeker.cvUrl || undefined,
                    },
                    user: {
                      ...candidate.user!,
                      phoneNumber: candidate.user!.phoneNumber || undefined,
                    },
                    isShortlisted,
                    interactionCount
                  };
                  
                  return (
                    <div
                      key={candidate.jobSeeker.id}
                      className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
                        isShortlisted 
                          ? "border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50" 
                          : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Profile Header */}
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {candidate.user?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {candidate.user?.name}
                                </h3>
                                {isShortlisted && (
                                  <Badge className="px-3 py-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-300 font-bold">
                                    <Heart className="h-3 w-3 mr-1" />
                                    ⭐ Shortlisted
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  <span>{candidate.user?.email}</span>
                                </div>
                                {candidate.user?.phoneNumber && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    <span>{candidate.user.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Skills and Experience */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {candidate.jobSeeker.experience && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Briefcase className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-bold text-gray-900">💼 Experience</h4>
                                </div>
                                <p className="text-gray-700 line-clamp-3">
                                  {candidate.jobSeeker.experience}
                                </p>
                              </div>
                            )}

                            {candidate.jobSeeker.skills && candidate.jobSeeker.skills.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Award className="h-4 w-4 text-green-600" />
                                  <h4 className="font-bold text-gray-900">🚀 Skills</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.jobSeeker.skills.slice(0, 4).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="px-3 py-1 border-2 border-green-300 text-green-700 bg-green-50 font-semibold">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.jobSeeker.skills.length > 4 && (
                                    <Badge variant="outline" className="px-3 py-1 border-2 border-gray-300 text-gray-700 bg-gray-50 font-semibold">
                                      +{candidate.jobSeeker.skills.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          {candidate.jobSeeker.bio && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-purple-600" />
                                <h4 className="font-bold text-gray-900">📝 About</h4>
                              </div>
                              <p className="text-gray-700 line-clamp-2">
                                {candidate.jobSeeker.bio}
                              </p>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-800">{interactionCount} interactions</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="font-semibold text-gray-700">Joined {new Date(candidate.jobSeeker.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          <CandidateProfileModal
                            candidate={candidateForModal}
                            trigger={
                              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl">
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            }
                          />
                          
                          <ContactButton email={candidate.user?.email} />
                          
                          {!isShortlisted ? (
                            <ShortlistModal
                              candidateId={candidate.jobSeeker.id}
                              candidateName={candidate.user?.name || 'Unknown'}
                              trigger={
                                <Button variant="outline" className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 font-semibold rounded-xl">
                                  <Heart className="h-4 w-4 mr-2" />
                                  Shortlist
                                </Button>
                              }
                            />
                          ) : (
                            <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Help Guide */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
              <Target className="h-6 w-6 text-blue-600" />
              🎯 Candidate Management Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-3">👁️ Review & Discover</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Browse detailed candidate profiles to identify the perfect fit for your roles and company culture
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-yellow-900 mb-3">⭐ Organize & Shortlist</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  Create organized shortlists to save your top candidates and streamline your hiring process
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-3">📅 Connect & Interview</h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Schedule interviews and connect directly with candidates to build your dream team
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-bold text-blue-900">💡 Pro Tip</h4>
              </div>
              <p className="text-blue-800 leading-relaxed">
                Use the advanced filters to quickly find candidates with specific skills, experience levels, or locations. 
                Regular engagement and quick response times help you secure top talent before your competitors!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}