'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Coffee, Presentation, Award, Building2, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  icon: React.ElementType;
  type: "main" | "break" | "networking" | "special";
  location?: string;
  capacity?: string;
}

const day1Events: TimelineEvent[] = [
  {
    time: "08:30 - 09:00",
    title: "Registration & Welcome",
    description: "Check-in, welcome kit distribution, and early networking",
    icon: Users,
    type: "main",
    location: "Main Entrance",
    capacity: "1000+ attendees"
  },
  {
    time: "09:00 - 09:30",
    title: "Opening Ceremony",
    description: "Welcome address by Nation Media Group and Huawei Technologies leadership",
    icon: Presentation,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees"
  },
  {
    time: "09:30 - 12:00",
    title: "Innovative Booths Experience",
    description: "Immersive company booths, resume drops, and direct dialogue with business representatives",
    icon: Building2,
    type: "main",
    location: "Exhibition Area",
    capacity: "All attendees"
  },
  {
    time: "10:00 - 12:00",
    title: "Morning Panel Discussions",
    description: "Sectoral insights from industry leaders and voice of experts",
    icon: Presentation,
    type: "special",
    location: "Panel Hall",
    capacity: "300+ attendees"
  },
  {
    time: "12:00 - 13:00",
    title: "Connect & Converse Lunch",
    description: "Networking lunch fostering organic, meaningful career-boosting interactions",
    icon: MessageCircle,
    type: "networking",
    location: "Networking Zone",
    capacity: "All attendees"
  },
  {
    time: "13:00 - 16:00",
    title: "Afternoon Sessions",
    description: "Continued booth visits, interviews, and career development workshops",
    icon: Users,
    type: "main",
    location: "All Zones",
    capacity: "500+ slots"
  },
  {
    time: "16:00 - 16:00",
    title: "Day 1 Wrap-up",
    description: "Feedback collection and day 2 preview",
    icon: Clock,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees"
  }
];

const day2Events: TimelineEvent[] = [
  {
    time: "08:30 - 09:00",
    title: "Day 2 Welcome",
    description: "Quick check-in and day 2 orientation",
    icon: Users,
    type: "main",
    location: "Main Entrance",
    capacity: "800+ attendees"
  },
  {
    time: "09:00 - 12:00",
    title: "Final Booth Sessions",
    description: "Last chance to visit innovative booths and connect with employers",
    icon: Building2,
    type: "main",
    location: "Exhibition Area",
    capacity: "All attendees"
  },
  {
    time: "10:00 - 12:00",
    title: "Final Panel Discussions",
    description: "Closing panel sessions with key industry insights",
    icon: Presentation,
    type: "special",
    location: "Panel Hall",
    capacity: "300+ attendees"
  },
  {
    time: "12:00 - 13:00",
    title: "Final Networking Lunch",
    description: "Last networking opportunity with refreshments and connections",
    icon: MessageCircle,
    type: "networking",
    location: "Networking Zone",
    capacity: "All attendees"
  },
  {
    time: "13:00 - 15:30",
    title: "Career Development Sessions",
    description: "Skills workshops and professional development opportunities",
    icon: Users,
    type: "main",
    location: "Workshop Rooms",
    capacity: "400+ attendees"
  },
  {
    time: "15:30 - 16:00",
    title: "Closing Ceremony",
    description: "Event conclusion, awards, and future opportunities announcement",
    icon: Award,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees"
  }
];

const typeColors = {
  main: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  break: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  networking: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  special: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export function TimelineSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
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

  const currentEvents = activeDay === 1 ? day1Events : day2Events;

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
    >
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <Badge 
            variant="outline" 
            className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
          >
            Event Schedule
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
              Two Days of
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Career Opportunities
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A carefully curated schedule designed to maximize networking opportunities 
            and career advancement for all participants.
          </p>
        </div>

        {/* Day Toggle */}
        <div className={`flex justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setActiveDay(1)}
              className={`px-8 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                activeDay === 1 
                  ? "bg-huawei-gradient text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Day 1 - June 26, 2025
            </button>
            <button
              onClick={() => setActiveDay(2)}
              className={`px-8 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                activeDay === 2 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Day 2 - June 27, 2025
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className={`relative transition-all duration-1000 delay-400 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 transform md:-translate-x-px"></div>

          <div className="space-y-8">
            {currentEvents.map((event, index) => {
              const Icon = event.icon;
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={`${activeDay}-${index}`}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 transform md:-translate-x-2 -translate-y-2 z-10">
                    <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md ${
                      event.type === 'special' 
                        ? 'bg-huawei-gradient' 
                        : event.type === 'networking' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-slate-400 dark:bg-slate-500'
                    }`}></div>
                  </div>

                  {/* Content Card */}
                  <div className={`ml-16 md:ml-0 w-full md:w-5/12 ${
                    isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  }`}>
                    <Card className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                            event.type === 'special' 
                              ? 'bg-huawei-gradient text-white' 
                              : event.type === 'networking' 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[var(--huawei-red)] transition-colors">
                                {event.title}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${typeColors[event.type]}`}
                              >
                                {event.time}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {event.description}
                            </p>
                            
                            {(event.location || event.capacity) && (
                              <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.capacity && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{event.capacity}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Empty space for the other side on desktop */}
                  <div className="hidden md:block w-5/12"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div className={`mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 dark:from-blue-900/20 dark:via-slate-800 dark:to-red-900/20 rounded-2xl p-8 border border-slate-200 dark:border-slate-600">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
              Important Information
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Calendar className="w-8 h-8 text-[var(--huawei-red)] mx-auto" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Advance Registration</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Register online before the event for priority access and QR code generation
                </p>
              </div>
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-[var(--nation-blue)] mx-auto" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Punctuality</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Please arrive 15 minutes early for scheduled interview slots
                </p>
              </div>
              <div className="space-y-2">
                <Users className="w-8 h-8 text-[var(--huawei-red)] mx-auto" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Dress Code</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Business professional attire is recommended for all participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 