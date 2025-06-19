import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  jobSeekers
} from "@/db/schema";
import { eq, count, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  GraduationCap,
  Calendar,
  Award,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { ExportButton } from "@/components/admin/export-button";

export default async function HuaweiStudentsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check admin access
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    redirect("/dashboard");
  }

  // Get statistics
  const [
    totalJobSeekers,
    huaweiStudents,
    conferenceAttendees,
    huaweiConferenceAttendees,
    certificationStats,
    conferenceStatusStats
  ] = await Promise.all([
    // Total job seekers
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId)),
    
    // Huawei students
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.isHuaweiStudent, true)),
    
    // Conference attendees
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.wantsToAttendConference, true)),
    
    // Huawei students attending conference
    db.select({ count: count() })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(and(
        eq(jobSeekers.isHuaweiStudent, true),
        eq(jobSeekers.wantsToAttendConference, true)
      )),
    
    // Certification level stats
    db.select({
      level: jobSeekers.huaweiCertificationLevel,
      count: count()
    })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.isHuaweiStudent, true))
      .groupBy(jobSeekers.huaweiCertificationLevel),
    
    // Conference status stats
    db.select({
      status: jobSeekers.conferenceAttendanceStatus,
      count: count()
    })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.wantsToAttendConference, true))
      .groupBy(jobSeekers.conferenceAttendanceStatus)
  ]);

  // Get all Huawei students
  const huaweiStudentsData = await db
    .select({
      id: jobSeekers.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      huaweiStudentId: jobSeekers.huaweiStudentId,
      huaweiCertificationLevel: jobSeekers.huaweiCertificationLevel,
      wantsToAttendConference: jobSeekers.wantsToAttendConference,
      conferenceAttendanceStatus: jobSeekers.conferenceAttendanceStatus,
      registrationStatus: jobSeekers.registrationStatus,
      createdAt: jobSeekers.createdAt,
    })
    .from(jobSeekers)
    .innerJoin(users, eq(users.id, jobSeekers.userId))
    .where(eq(jobSeekers.isHuaweiStudent, true))
    .orderBy(desc(jobSeekers.createdAt));

  // Get all conference attendees
  const conferenceAttendeesData = await db
    .select({
      id: jobSeekers.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      isHuaweiStudent: jobSeekers.isHuaweiStudent,
      huaweiStudentId: jobSeekers.huaweiStudentId,
      huaweiCertificationLevel: jobSeekers.huaweiCertificationLevel,
      conferenceAttendanceStatus: jobSeekers.conferenceAttendanceStatus,
      conferenceRegistrationDate: jobSeekers.conferenceRegistrationDate,
      conferencePreferences: jobSeekers.conferencePreferences,
      registrationStatus: jobSeekers.registrationStatus,
      createdAt: jobSeekers.createdAt,
    })
    .from(jobSeekers)
    .innerJoin(users, eq(users.id, jobSeekers.userId))
    .where(eq(jobSeekers.wantsToAttendConference, true))
    .orderBy(desc(jobSeekers.createdAt));

  // Export data
  const exportData = {
    generatedAt: new Date().toISOString(),
    statistics: {
      totalJobSeekers: totalJobSeekers[0]?.count || 0,
      huaweiStudents: huaweiStudents[0]?.count || 0,
      conferenceAttendees: conferenceAttendees[0]?.count || 0,
      huaweiConferenceAttendees: huaweiConferenceAttendees[0]?.count || 0,
    },
    certificationStats,
    conferenceStatusStats,
    huaweiStudents: huaweiStudentsData,
    conferenceAttendees: conferenceAttendeesData
  };

  const getCertificationBadgeColor = (level: string | null) => {
    switch (level) {
      case 'HCIE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HCIP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HCIA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getConferenceStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'registered':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'attended':
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      case 'no_show':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Huawei Students & Conference Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Manage Huawei student certifications and conference attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton 
              data={exportData}
              filename={`huawei-students-report-${new Date().toISOString().split('T')[0]}.json`}
              label="Export Report"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Job Seekers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(totalJobSeekers[0]?.count || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Huawei Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(huaweiStudents[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-purple-100 text-sm mt-1">
                {totalJobSeekers[0]?.count > 0 
                  ? Math.round(((huaweiStudents[0]?.count || 0) / totalJobSeekers[0].count) * 100)
                  : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Conference Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(conferenceAttendees[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-green-100 text-sm mt-1">
                {totalJobSeekers[0]?.count > 0 
                  ? Math.round(((conferenceAttendees[0]?.count || 0) / totalJobSeekers[0].count) * 100)
                  : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Huawei + Conference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(huaweiConferenceAttendees[0]?.count || 0).toLocaleString()}
              </div>
              <p className="text-orange-100 text-sm mt-1">
                {huaweiStudents[0]?.count > 0 
                  ? Math.round(((huaweiConferenceAttendees[0]?.count || 0) / huaweiStudents[0].count) * 100)
                  : 0}% of Huawei students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Certification & Conference Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Certification Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificationStats.map((cert, index) => {
                const total = huaweiStudents[0]?.count || 1;
                const percentage = Math.round((cert.count / total) * 100);
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <Badge className={getCertificationBadgeColor(cert.level)}>
                      {cert.level || 'No Certification'}
                    </Badge>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {cert.count.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Conference Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conferenceStatusStats.map((status, index) => {
                const total = conferenceAttendees[0]?.count || 1;
                const percentage = Math.round((status.count / total) * 100);
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getConferenceStatusIcon(status.status)}
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {status.status || 'Registered'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {status.count.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Huawei Students List */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Huawei Students ({(huaweiStudents[0]?.count || 0).toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {huaweiStudentsData.map((student) => (
                <div key={student.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {student.name}
                        </h3>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Huawei Student
                        </Badge>
                        {student.wantsToAttendConference && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            Conference
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </div>
                        {student.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {student.phoneNumber}
                          </div>
                        )}
                        {student.huaweiStudentId && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            ID: {student.huaweiStudentId}
                          </div>
                        )}
                      </div>

                      {student.huaweiCertificationLevel && (
                        <div className="mt-2">
                          <Badge className={getCertificationBadgeColor(student.huaweiCertificationLevel)}>
                            {student.huaweiCertificationLevel} Certified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {student.conferenceAttendanceStatus && (
                        <div className="flex items-center gap-2">
                          {getConferenceStatusIcon(student.conferenceAttendanceStatus)}
                          <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                            {student.conferenceAttendanceStatus}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conference Attendees List */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Conference Attendees ({(conferenceAttendees[0]?.count || 0).toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conferenceAttendeesData.map((attendee) => (
                <div key={attendee.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {attendee.name}
                        </h3>
                        {attendee.isHuaweiStudent && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Huawei Student
                          </Badge>
                        )}
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Calendar className="w-3 h-3 mr-1" />
                          Conference
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {attendee.email}
                        </div>
                        {attendee.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {attendee.phoneNumber}
                          </div>
                        )}
                        {attendee.conferenceRegistrationDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Registered: {new Date(attendee.conferenceRegistrationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {attendee.huaweiCertificationLevel && (
                        <div className="mt-2">
                          <Badge className={getCertificationBadgeColor(attendee.huaweiCertificationLevel)}>
                            {attendee.huaweiCertificationLevel} Certified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {attendee.conferenceAttendanceStatus && (
                        <div className="flex items-center gap-2">
                          {getConferenceStatusIcon(attendee.conferenceAttendanceStatus)}
                          <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                            {attendee.conferenceAttendanceStatus}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(attendee.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 