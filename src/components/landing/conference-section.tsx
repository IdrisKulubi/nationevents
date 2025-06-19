'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Presentation,
  Award,
  Coffee,
  Network,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  MapPin,
  Star
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
      className="py-24 bg-gradient-to-b from-white via-indigo-50 to-white dark:from-slate-900 dark:via-indigo-900/20 dark:to-slate-900"
    >
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <Badge 
            variant="outline" 
            className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 backdrop-blur-sm border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
          >
            Pre-Event Conference
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
              Join Our Exclusive
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pre-Job Fair Conference
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Before the main job fair begins, join us for an inspiring conference featuring industry experts, 
            networking opportunities, and skill development sessions. <strong>Open to everyone</strong> - 
            whether you&apos;re a job seeker, student, or professional looking to grow your network.
          </p>

          {/* Conference Details */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Same Day as Job Fair</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Morning before Job Fair</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Same Venue</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full shadow-sm border border-green-200 dark:border-green-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-300">Free Attendance</span>
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
                className={`group hover:shadow-xl transition-all duration-300 border-0 ${
                  highlight.highlight 
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg' 
                    : 'bg-white/50 dark:bg-slate-800/50'
                } backdrop-blur-sm hover:scale-105`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    highlight.highlight 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      highlight.highlight 
                        ? 'text-white' 
                        : 'text-slate-600 dark:text-slate-300'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {highlight.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {highlight.description}
                  </p>

                  {highlight.highlight && (
                    <div className="mt-4">
                      <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
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

       

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Kickstart Your Career Journey?
            </h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of professionals, students, and industry leaders for a day of inspiration, 
              learning, and networking. Register for the job fair and get automatic access to the conference!
            </p>

            <Link href="/login">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-slate-50 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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