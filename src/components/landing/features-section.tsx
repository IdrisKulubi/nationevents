'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Calendar, 
  QrCode, 
  Shield, 
  Smartphone, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  Zap,
  MessageCircle,
  Presentation,
  Building2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  category: "seeker" | "employer" | "admin" | "security" | "highlights";
  highlight?: boolean;
}

const features: Feature[] = [
  {
    icon: Building2,
    title: "Innovative Booths",
    description: "Dive into immersive company experiences, drop off resumes, and dialogue with business representatives.",
    category: "highlights",
    highlight: true
  },
  {
    icon: Presentation,
    title: "Engaging Panel Discussions",
    description: "Sectoral insights from the voices that lead them - learn from industry experts and thought leaders.",
    category: "highlights",
    highlight: true
  },
  {
    icon: MessageCircle,
    title: "Connect & Converse",
    description: "Foster organic, meaningful, career-boosting interactions with professionals and peers.",
    category: "highlights",
    highlight: true
  },
  {
    icon: Users,
    title: "Smart Registration",
    description: "Seamless pre-registration with CV upload and profile management for job seekers.",
    category: "seeker"
  },
  {
    icon: QrCode,
    title: "QR Code Check-in",
    description: "Digital QR codes for quick event entry and interview slot management.",
    category: "seeker"
  },
  {
    icon: Calendar,
    title: "Interview Scheduling",
    description: "AI-powered interview slot selection and real-time calendar integration.",
    category: "seeker"
  },
  {
    icon: Briefcase,
    title: "Employer Dashboard",
    description: "Comprehensive booth management and candidate tracking for employers.",
    category: "employer"
  },
  {
    icon: Star,
    title: "CV Access Portal",
    description: "Instant access to candidate profiles and CV library with smart filtering.",
    category: "employer"
  },
  {
    icon: CheckCircle,
    title: "Shortlist Management",
    description: "Real-time candidate shortlisting and feedback submission system.",
    category: "employer"
  },
  {
    icon: Shield,
    title: "Security Module",
    description: "Advanced QR scanning and manual verification for security personnel.",
    category: "security"
  },
  {
    icon: Clock,
    title: "Real-time Monitoring",
    description: "Live attendance tracking and incident reporting capabilities.",
    category: "security"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Fully responsive design with offline functionality for all devices.",
    category: "admin"
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Real-time SMS and email alerts for all platform activities.",
    category: "admin"
  }
];

const categoryColors = {
  highlights: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  seeker: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  employer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
};

const categoryLabels = {
  highlights: "Event Highlights",
  seeker: "Job Seekers",
  employer: "Employers",
  security: "Security",
  admin: "Administrators"
};

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("highlights");
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

  const filteredFeatures = activeFilter === "all" 
    ? features 
    : features.filter(feature => feature.category === activeFilter);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <Badge 
            variant="outline" 
            className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
          >
            Event Experience
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
              A Grand Gathering of
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Innovation, Synergy & Opportunity
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            More than just an event - it&apos;s an avenue for innovation, synergy, and opportunity. 
            Job opportunities are futures waiting to be shaped.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === "all" 
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            All Features
          </button>
          
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === key 
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-400 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isHighlight = feature.highlight;
            
            return (
              <Card 
                key={`${feature.title}-${index}`}
                className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
                  isHighlight 
                    ? "border-2 border-transparent bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 shadow-lg" 
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {isHighlight && (
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/50 dark:to-slate-600/20"></div>
                )}
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isHighlight 
                        ? "bg-huawei-gradient text-white shadow-lg" 
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[var(--huawei-red)] transition-colors">
                          {feature.title}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${categoryColors[feature.category]}`}
                        >
                          {categoryLabels[feature.category]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-600">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Ready to Experience the Future of Job Fairs?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Join hundreds of professionals who are already transforming their career journey 
              with our innovative platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-huawei-gradient text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                Start Your Journey
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 