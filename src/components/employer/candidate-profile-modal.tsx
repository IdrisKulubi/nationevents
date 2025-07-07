"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  Heart, 
  Download, 
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Star
} from "lucide-react";
import { addToShortlist, logCandidateInteraction } from "@/app/api/employer/shortlists/actions";
import { Candidate } from "@/app/employer/candidates/client-page";

interface CandidateProfileModalProps {
  candidate: Candidate;
  trigger?: React.ReactNode;
  onShortlistUpdate?: () => void;
}

export function CandidateProfileModal({ 
  candidate, 
  trigger, 
  onShortlistUpdate 
}: CandidateProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewProfile = async () => {
    if (!open) {
      // Log interaction when modal opens
      try {
        await logCandidateInteraction({
          jobSeekerId: candidate.jobSeeker.id,
          interactionType: "cv_viewed",
          notes: "Profile viewed from candidate list"
        });
      } catch (error) {
        console.error("Error logging interaction:", error);
      }
    }
  };

  const handleShortlist = async () => {
    setLoading(true);
    try {
      const result = await addToShortlist({
        jobSeekerId: candidate.jobSeeker.id,
        listName: "General Interest",
        priority: "medium",
        notes: `Added from candidate profile - ${new Date().toLocaleDateString()}`
      });

      if (result.success) {
        onShortlistUpdate?.();
      }
    } catch (error) {
      console.error("Error adding to shortlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    // Log contact interaction
    logCandidateInteraction({
      jobSeekerId: candidate.jobSeeker.id,
      interactionType: "contact_info_accessed",
      notes: "Contact information accessed"
    });
    
    // Open email client
    window.location.href = `mailto:${candidate.user.email}`;
  };

  const handleDownloadCV = async () => {
    // Log CV download interaction
    try {
      await logCandidateInteraction({
        jobSeekerId: candidate.jobSeeker.id,
        interactionType: "cv_viewed",
        notes: "CV downloaded from profile"
      });
    } catch (error) {
      console.error("Error logging interaction:", error);
    }

    // Open CV in new tab if available
    if (candidate.jobSeeker.cvUrl) {
      window.open(candidate.jobSeeker.cvUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (newOpen) {
        handleViewProfile();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {candidate.user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{candidate.user.name}</h2>
              <p className="text-gray-600">{candidate.user.email}</p>
            </div>
            {candidate.isShortlisted && (
              <Badge className="bg-yellow-100 text-yellow-800 ml-auto">
                <Heart className="h-3 w-3 mr-1" />
                Shortlisted
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4" />
                <span className="break-all">{candidate.user.email}</span>
              </div>
              {candidate.user.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{candidate.user.phoneNumber}</span>
                </div>
              )}
             
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Member since {candidate.jobSeeker.createdAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {candidate.jobSeeker.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{candidate.jobSeeker.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {candidate.jobSeeker.experience && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{candidate.jobSeeker.experience}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {candidate.jobSeeker.education && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{candidate.jobSeeker.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.jobSeeker.skills && candidate.jobSeeker.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.jobSeeker.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(candidate.jobSeeker.portfolioUrl || candidate.jobSeeker.linkedinUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {candidate.jobSeeker.portfolioUrl && (
                  <a
                    href={candidate.jobSeeker.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline break-all"
                  >
                    Portfolio Website
                  </a>
                )}
                {candidate.jobSeeker.linkedinUrl && (
                  <a
                    href={candidate.jobSeeker.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline break-all"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          {candidate.interactionCount !== undefined && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Profile views by your company</span>
                  <span className="font-medium">{candidate.interactionCount} times</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleContact} className="flex-1 sm:flex-none">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
            
            {candidate.jobSeeker.cvUrl && (
              <Button variant="outline" onClick={handleDownloadCV} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            )}
            
            {!candidate.isShortlisted && (
              <Button 
                variant="outline" 
                onClick={handleShortlist}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <Heart className="h-4 w-4 mr-2" />
                {loading ? "Adding..." : "Shortlist"}
              </Button>
            )}
            
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 