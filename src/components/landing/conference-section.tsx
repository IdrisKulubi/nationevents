'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Presentation, Award, Coffee, Network, Lightbulb, ArrowRight, CheckCircle, MapPin, Star } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Conference3DCard } from "./conference-3d-card";

interface ConferenceHighlight {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: boolean;
}

const conferenceHighlights: ConferenceHighlight[] = [
  {
    icon: Presentation,
    title: "Industry Expert Keynotes",
    description: "Learn from leading professionals and thought leaders in technology, innovation, and career development.",
    highlight: true
  },
  {
    icon: Network,
    title: "Networking Sessions",
    description: "Connect with industry professionals, fellow job seekers, and potential mentors in structured networking activities.",
    highlight: true
  },
  {
    icon: Lightbulb,
    title: "Skills Development Workshops",
    description: "Participate in hands-on workshops covering in-demand skills, interview techniques, and career advancement strategies.",
    highlight: true
  },
  {
    icon: Award,
    title: "Huawei Certification Insights",
    description: "Special sessions for Huawei students and certification holders, featuring exclusive opportunities and pathways.",
  },
  {
    icon: Coffee,
    title: "Interactive Panel Discussions",
    description: "Engage in Q&A sessions with industry leaders discussing current trends, challenges, and opportunities.",
  },
  {
    icon: Users,
    title: "Career Guidance Sessions",
    description: "One-on-one career counseling and guidance from experienced professionals and HR experts.",
  }
];

const conferenceSchedule = [
  { time: "8:00 AM", activity: "Registration & Welcome Coffee" },
  { time: "9:00 AM", activity: "Opening Keynote: Future of Work" },
  { time: "10:30 AM", activity: "Panel: Industry Trends & Opportunities" },
  { time: "12:00 PM", activity: "Networking Lunch" },
  { time: "1:30 PM", activity: "Skills Development Workshops" },
  { time: "3:00 PM", activity: "Huawei Student Special Session" },
  { time: "4:30 PM", activity: "Career Guidance & Closing Remarks" }
];

export function ConferenceSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="conference"
      className="relative py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
    >
      {/* Cool Curve at Top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg 
          className="relative block w-full h-20" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,0 Z" 
            className="fill-white/5"
          />
          <path 
            d="M0,0 C300,80 600,20 900,60 C1000,80 1100,40 1200,60 L1200,0 Z" 
            className="fill-purple-500/10"
          />
          <path 
            d="M0,0 C200,60 400,40 600,70 C800,100 1000,20 1200,40 L1200,0 Z" 
            className="fill-pink-500/5"
          />
        </svg>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <Badge 
            variant="outline" 
            className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30"
          >
            Pre-Event Conference
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Join Our Exclusive
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pre-Job Fair Conference
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Before the main job fair begins, join us for an inspiring conference featuring industry experts, 
            networking opportunities, and skill development sessions. <strong>Open to everyone</strong> - 
            whether you&apos;re a job seeker, student, or professional looking to grow your network.
          </p>

          {/* Conference Details */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/5 border-white/10 backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">Same Day as Job Fair</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border-white/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">Morning before Job Fair</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border-white/10 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">Same Venue</span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 border-green-500/30 text-green-300">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-300">Free Attendance</span>
            </div>
          </div>
        </div>

        {/* Conference Highlights */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          {conferenceHighlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <Card 
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:scale-105 ${
                  highlight.highlight 
                    ? 'bg-white/10 border-purple-500/30' 
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    highlight.highlight 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-white/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      highlight.highlight 
                        ? 'text-white' 
                        : 'text-white'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-white transition-colors">
                    {highlight.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {highlight.description}
                  </p>

                  {highlight.highlight && (
                    <div className="mt-4">
                      <Badge className="bg-purple-500/20 text-purple-300">
                        <Star className="w-3 h-3 mr-1" />
                        Featured Session
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 3D Interactive Card */}
        <div className={`flex justify-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <Conference3DCard />
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Ready to Kickstart Your Career Journey?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join hundreds of professionals, students, and industry leaders for a day of inspiration, 
              learning, and networking. Register for the job fair and get automatic access to the conference!
            </p>

            <Link href="/login">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Register for Job Fair & Conference
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}