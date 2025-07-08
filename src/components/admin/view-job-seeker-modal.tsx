"use client";

import { useState } from "react";
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
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Download
} from "lucide-react";
import { openCvInNewTab } from "@/lib/s3-utils";
import Image from "next/image";

interface JobSeekerData {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    image?: string;
    createdAt: Date;
    lastActive: Date;
    isActive: boolean;
  };
  jobSeeker: {
    id: string;
    userId: string;
    registrationStatus: string;
    skills?: string[];
    experience?: string;
    pin?: string;
    cvUrl?: string;
    location?: string;
    education?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

interface ViewJobSeekerModalProps {
  trigger: React.ReactNode;
  jobSeekerData: JobSeekerData;
  onApprove?: (jobSeekerId: string) => void;
  onReject?: (jobSeekerId: string) => void;
}

export function ViewJobSeekerModal({ 
  trigger, 
  jobSeekerData, 
  onApprove, 
  onReject 
}: ViewJobSeekerModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const { user, jobSeeker } = jobSeekerData;

  const skillsArray = jobSeeker?.skills
    ? (Array.isArray(jobSeeker.skills)
      ? jobSeeker.skills
      : typeof jobSeeker.skills === 'string'
      ? (jobSeeker.skills as string).split(',').map(s => s.trim())
      : [])
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return XCircle;
      default: return Clock;
    }
  };

  const handleViewCV = () => {
    if (jobSeeker?.cvUrl) {
      console.log('CV URL from modal:', jobSeeker.cvUrl);
      openCvInNewTab(jobSeeker.cvUrl);
    }
  };

  const handleApprove = async () => {
    if (!jobSeeker?.id || !onApprove) return;
    
    setLoading('approve');
    try {
      await onApprove(jobSeeker.id);
      // Modal might close from parent component refresh
    } catch (error) {
      console.error('Error approving job seeker:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!jobSeeker?.id || !onReject) return;
    
    setLoading('reject');
    try {
      await onReject(jobSeeker.id);
      // Modal might close from parent component refresh
    } catch (error) {
      console.error('Error rejecting job seeker:', error);
    } finally {
      setLoading(null);
    }
  };

  const StatusIcon = getStatusIcon(jobSeeker?.registrationStatus || '');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Job Seeker Profile: {user.name}
          </DialogTitle>
          <DialogDescription>
            Complete profile information and registration details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with photo and basic info */}
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {user.image ? (
                    <Image 
                      src={user.image} 
                      alt={user.name} 
                      className="w-24 h-24 rounded-full object-cover"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <span className="text-2xl font-medium text-gray-600">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                      <div className="flex items-center gap-4 mt-2 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      {jobSeeker?.pin && (
                        <div className="flex items-center gap-1 mt-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">PIN: {jobSeeker.pin}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(jobSeeker?.registrationStatus || '')}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {jobSeeker?.registrationStatus}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience Level</label>
                  <p className="text-gray-900 capitalize mt-1">
                    {jobSeeker?.experience || 'Not specified'}
                  </p>
                </div>
                
                {jobSeeker?.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{jobSeeker.location}</span>
                    </div>
                  </div>
                )}

                {jobSeeker?.education && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <div className="flex items-center gap-1 mt-1">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{jobSeeker.education}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skillsArray && skillsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsArray.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills specified</p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobSeeker?.cvUrl ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">Curriculum Vitae</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleViewCV}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View CV
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No CV uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Active</span>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Active</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registration Date</span>
                  <span className="text-sm text-gray-900">
                    {jobSeeker?.createdAt ? new Date(jobSeeker.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {jobSeeker?.cvUrl && (
                <Button 
                  variant="outline"
                  onClick={handleViewCV}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {jobSeeker?.registrationStatus === 'pending' && (
                <>
                  <Button
                    onClick={handleReject}
                    disabled={loading !== null}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {loading === 'reject' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={loading !== null}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading === 'approve' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 