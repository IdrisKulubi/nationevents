"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  
  Star, 
  
  Globe, 
  Linkedin, 
  Shield,
  UserCheck,
  
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getUserDetails } from "@/lib/actions/admin-actions";
import { format } from "date-fns";

interface UserDetailsModalProps {
  trigger: React.ReactNode;
  userId: string;
}

interface UserData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
    isActive: boolean | null;
    phoneNumber?: string | null;
    image?: string | null;
    createdAt: Date;
    lastActive: Date;
    updatedAt: Date;
  };
  jobSeeker?: {
    id: string;
    bio?: string;
    cvUrl?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    expectedSalary?: string;
    availableFrom?: Date;
    linkedinUrl?: string;
    portfolioUrl?: string;
    registrationStatus?: string;
    pin?: string;
    ticketNumber?: string;
    isHuaweiStudent?: boolean;
    huaweiStudentId?: string;
    huaweiCertificationLevel?: string;
    wantsToAttendConference?: boolean;
    interestCategories?: string[];
    additionalDocuments?: any[];
  };
  employer?: {
    id: string;
    companyName: string;
    industry?: string;
    companySize?: string;
    website?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isVerified?: boolean;
    logoUrl?: string;
    description?: string;
  };
}

export function UserDetailsModal({ trigger, userId }: UserDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string>("");

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const result = await getUserDetails(userId);
      if (result.success) {
        setUserData(result.data as UserData);
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("An error occurred while fetching user details");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId, fetchUserDetails]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "employer": return "bg-blue-100 text-blue-800";
      case "job_seeker": return "bg-green-100 text-green-800";
      case "security": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Shield;
      case "employer": return Building;
      case "job_seeker": return UserCheck;
      case "security": return Shield;
      default: return User;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive user profile and activity information
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading user details...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {userData && !loading && (
          <div className="space-y-6">
            {/* User Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userData.user.image || ''} alt={userData.user.name || ''} />
                    <AvatarFallback className="text-lg">
                      {(userData.user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{userData.user.name}</h3>
                      <Badge className={getRoleColor(userData.user.role || 'job_seeker')}>
                        {(userData.user.role || 'job_seeker').replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const StatusIcon = getStatusIcon(userData.user.isActive || false);
                          return <StatusIcon className={`h-4 w-4 ${getStatusColor(userData.user.isActive || false)}`} />;
                        })()}
                        <span className={`text-sm ${getStatusColor(userData.user.isActive || false)}`}>
                          {userData.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{userData.user.email}</span>
                      </div>
                      {userData.user.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{userData.user.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {format(new Date(userData.user.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Last active {format(new Date(userData.user.lastActive), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Seeker Details */}
            {userData.jobSeeker && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Job Seeker Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.jobSeeker.bio && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                      <p className="text-gray-600 text-sm">{userData.jobSeeker.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.jobSeeker.experience && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Experience Level</h4>
                        <p className="text-gray-600 text-sm capitalize">{userData.jobSeeker.experience}</p>
                      </div>
                    )}
                    
                    {userData.jobSeeker.education && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Education</h4>
                        <p className="text-gray-600 text-sm">{userData.jobSeeker.education}</p>
                      </div>
                    )}

                    {userData.jobSeeker.expectedSalary && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Expected Salary</h4>
                        <p className="text-gray-600 text-sm">{userData.jobSeeker.expectedSalary}</p>
                      </div>
                    )}

                    {userData.jobSeeker.availableFrom && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Available From</h4>
                        <p className="text-gray-600 text-sm">
                          {format(new Date(userData.jobSeeker.availableFrom), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>

                  {userData.jobSeeker.skills && userData.jobSeeker.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {userData.jobSeeker.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userData.jobSeeker.interestCategories && userData.jobSeeker.interestCategories.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Interest Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {userData.jobSeeker.interestCategories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.jobSeeker.linkedinUrl && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        <a 
                          href={userData.jobSeeker.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    
                    {userData.jobSeeker.portfolioUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <a 
                          href={userData.jobSeeker.portfolioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline text-sm"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Event Registration Info */}
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userData.jobSeeker.registrationStatus && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Registration Status</h4>
                        <Badge className={
                          userData.jobSeeker.registrationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          userData.jobSeeker.registrationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {userData.jobSeeker.registrationStatus}
                        </Badge>
                      </div>
                    )}
                    
                    {userData.jobSeeker.ticketNumber && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Ticket Number</h4>
                        <p className="text-gray-600 text-sm font-mono">{userData.jobSeeker.ticketNumber}</p>
                      </div>
                    )}
                    
                    {userData.jobSeeker.pin && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">PIN</h4>
                        <p className="text-gray-600 text-sm font-mono">{userData.jobSeeker.pin}</p>
                      </div>
                    )}
                  </div>

                  {/* Huawei Student Info */}
                  {userData.jobSeeker.isHuaweiStudent && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Huawei Student
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {userData.jobSeeker.huaweiStudentId && (
                          <div>
                            <span className="font-medium text-orange-800">Student ID:</span>
                            <span className="ml-2 text-orange-700">{userData.jobSeeker.huaweiStudentId}</span>
                          </div>
                        )}
                        {userData.jobSeeker.huaweiCertificationLevel && (
                          <div>
                            <span className="font-medium text-orange-800">Certification Level:</span>
                            <span className="ml-2 text-orange-700">{userData.jobSeeker.huaweiCertificationLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conference Registration */}
                  {userData.jobSeeker.wantsToAttendConference && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Conference Registration
                      </h4>
                      <p className="text-blue-700 text-sm">Registered for conference attendance</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Employer Details */}
            {userData.employer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Employer Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Company Name</h4>
                      <p className="text-gray-600 text-sm">{userData.employer.companyName}</p>
                    </div>
                    
                    {userData.employer.industry && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Industry</h4>
                        <p className="text-gray-600 text-sm">{userData.employer.industry}</p>
                      </div>
                    )}

                    {userData.employer.companySize && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Company Size</h4>
                        <p className="text-gray-600 text-sm capitalize">{userData.employer.companySize}</p>
                      </div>
                    )}

                    {userData.employer.contactPerson && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Contact Person</h4>
                        <p className="text-gray-600 text-sm">{userData.employer.contactPerson}</p>
                      </div>
                    )}

                    {userData.employer.contactEmail && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Contact Email</h4>
                        <p className="text-gray-600 text-sm">{userData.employer.contactEmail}</p>
                      </div>
                    )}

                    {userData.employer.contactPhone && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Contact Phone</h4>
                        <p className="text-gray-600 text-sm">{userData.employer.contactPhone}</p>
                      </div>
                    )}
                  </div>

                  {userData.employer.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <a 
                        href={userData.employer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {userData.employer.website}
                      </a>
                    </div>
                  )}

                  {userData.employer.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm">{userData.employer.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Verification Status:</span>
                    <Badge className={userData.employer.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {userData.employer.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 