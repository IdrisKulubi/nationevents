"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Linkedin, Twitter, Globe, Calendar, MapPin, Clock } from "lucide-react";
import { SpeakerProfileData } from "@/lib/types/nxt-her-speakers";
import { SpeakerScheduleView } from "./speaker-schedule-view";
import { format } from "date-fns";
import Link from "next/link";

interface SpeakerProfileCardProps {
  speakerData: SpeakerProfileData;
}

export function SpeakerProfileCard({ speakerData }: SpeakerProfileCardProps) {
  const { speaker, sessions } = speakerData;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "speaker":
        return "bg-green-100 text-green-800 border-green-200";
      case "panelist":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSessionTypeColor = (sessionType?: string) => {
    switch (sessionType) {
      case "keynote":
        return "bg-red-100 text-red-800 border-red-200";
      case "panel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "workshop":
        return "bg-green-100 text-green-800 border-green-200";
      case "networking":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "breakout":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Speaker Header Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={speaker.profilePhotoUrl} 
                  alt={speaker.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                  {getInitials(speaker.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Speaker Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{speaker.name}</h1>
                  {speaker.isKeynote && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      Keynote Speaker
                    </Badge>
                  )}
                </div>
                
                {(speaker.jobTitle || speaker.organization) && (
                  <p className="text-xl text-gray-600">
                    {speaker.jobTitle}
                    {speaker.jobTitle && speaker.organization && " at "}
                    {speaker.organization && (
                      <span className="font-semibold text-gray-800">{speaker.organization}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2">
                {speaker.linkedinUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={speaker.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {speaker.twitterUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={speaker.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  </Button>
                )}
                
                {speaker.websiteUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={speaker.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>

              {/* Expertise Tags */}
              {speaker.expertise && speaker.expertise.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Areas of Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {speaker.expertise.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Bio Section */}
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">About</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {speaker.bio}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speaker Schedule */}
      {sessions.length > 0 && (
        <SpeakerScheduleView speakerData={speakerData} />
      )}
    </div>
  );
}