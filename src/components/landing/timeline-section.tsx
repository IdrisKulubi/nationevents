"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Presentation,
  Award,
  Building2,
  MessageCircle,
  Coffee,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

interface TimelineEvent {
  time: string
  title: string
  description: string
  icon: React.ElementType
  type: "main" | "break" | "networking" | "special"
  location?: string
  capacity?: string
  featured?: boolean
}

const day1Events: TimelineEvent[] = [
  {
    time: "08:30 - 09:00",
    title: "Registration & Welcome",
    description: "Check-in, welcome kit distribution, and early networking with coffee and light refreshments",
    icon: Users,
    type: "main",
    location: "Main Entrance",
    capacity: "1000+ attendees",
  },
  {
    time: "09:00 - 09:30",
    title: "Opening Ceremony",
    description: "Welcome address by Nation Media Group and Huawei Technologies leadership with keynote presentations",
    icon: Presentation,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees",
    featured: true,
  },
  {
    time: "09:30 - 12:00",
    title: "Innovative Booths Experience",
    description: "Immersive company booths, resume drops, and direct dialogue with business representatives",
    icon: Building2,
    type: "main",
    location: "Exhibition Area",
    capacity: "All attendees",
  },
  {
    time: "10:30 - 11:00",
    title: "Coffee Break & Networking",
    description: "Refreshment break with structured networking activities and industry mixers",
    icon: Coffee,
    type: "break",
    location: "Networking Lounge",
    capacity: "All attendees",
  },
  {
    time: "11:00 - 12:00",
    title: "Morning Panel Discussions",
    description: "Sectoral insights from industry leaders and voice of experts on future trends",
    icon: Presentation,
    type: "special",
    location: "Panel Hall",
    capacity: "300+ attendees",
    featured: true,
  },
  {
    time: "12:00 - 13:00",
    title: "Connect & Converse Lunch",
    description: "Networking lunch fostering organic, meaningful career-boosting interactions",
    icon: MessageCircle,
    type: "networking",
    location: "Networking Zone",
    capacity: "All attendees",
  },
  {
    time: "13:00 - 16:00",
    title: "Afternoon Sessions",
    description: "Continued booth visits, one-on-one interviews, and career development workshops",
    icon: Users,
    type: "main",
    location: "All Zones",
    capacity: "500+ slots",
  },
  {
    time: "16:00 - 16:30",
    title: "Day 1 Wrap-up & Awards",
    description: "Feedback collection, day 2 preview, and recognition of outstanding participants",
    icon: Award,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees",
  },
]

const day2Events: TimelineEvent[] = [
  {
    time: "08:30 - 09:00",
    title: "Day 2 Welcome",
    description: "Quick check-in, day 2 orientation, and morning energizer activities",
    icon: Users,
    type: "main",
    location: "Main Entrance",
    capacity: "800+ attendees",
  },
  {
    time: "09:00 - 12:00",
    title: "Final Booth Sessions",
    description: "Last chance to visit innovative booths and connect with employers for final interviews",
    icon: Building2,
    type: "main",
    location: "Exhibition Area",
    capacity: "All attendees",
  },
  {
    time: "10:00 - 12:00",
    title: "Skills Development Workshops",
    description: "Hands-on workshops covering in-demand skills, interview techniques, and career advancement",
    icon: Presentation,
    type: "special",
    location: "Workshop Rooms",
    capacity: "100+ attendees",
    featured: true,
  },
  {
    time: "12:00 - 13:00",
    title: "Final Networking Lunch",
    description: "Last networking opportunity with refreshments, connections, and career guidance",
    icon: MessageCircle,
    type: "networking",
    location: "Networking Zone",
    capacity: "All attendees",
  },
  {
    time: "13:00 - 15:30",
    title: "Career Development Sessions",
    description: "One-on-one career counseling, portfolio reviews, and professional development opportunities",
    icon: Users,
    type: "main",
    location: "Counseling Rooms",
    capacity: "400+ attendees",
  },
  {
    time: "15:30 - 16:00",
    title: "Closing Ceremony & Future Opportunities",
    description: "Event conclusion, success stories, awards ceremony, and announcement of future opportunities",
    icon: Award,
    type: "special",
    location: "Main Stage",
    capacity: "All attendees",
    featured: true,
  },
]

const typeStyles = {
  main: {
    bg: "bg-gradient-to-r from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/30",
    text: "text-blue-300",
    icon: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  break: {
    bg: "bg-gradient-to-r from-green-500/20 to-emerald-600/20",
    border: "border-green-500/30",
    text: "text-green-300",
    icon: "bg-gradient-to-r from-green-500 to-emerald-600",
  },
  networking: {
    bg: "bg-gradient-to-r from-purple-500/20 to-purple-600/20",
    border: "border-purple-500/30",
    text: "text-purple-300",
    icon: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  special: {
    bg: "bg-gradient-to-r from-pink-500/20 to-rose-600/20",
    border: "border-pink-500/30",
    text: "text-pink-300",
    icon: "bg-gradient-to-r from-pink-500 to-rose-600",
  },
}

export function TimelineSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeDay, setActiveDay] = useState<1 | 2>(1)
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const currentEvents = activeDay === 1 ? day1Events : day2Events

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-purple-900 text-white overflow-hidden"
    >
      {/* Curved Top Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-24"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-slate-900"
          ></path>
        </svg>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div
            className={`text-center mb-20 transition-all duration-1000 ${isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
          >
            <Badge variant="outline" className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Event Schedule
            </Badge>

            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Two Days of
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Career Transformation
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              A meticulously crafted schedule designed to maximize networking opportunities, skill development, and
              career advancement for all participants.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="font-medium">2 Full Days</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium">1000+ Attendees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Building2 className="w-4 h-4 text-pink-400" />
                <span className="font-medium">50+ Companies</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 border-green-500/30 px-4 py-2 rounded-full border">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-300">Free Entry</span>
              </div>
            </div>
          </div>

          {/* Day Toggle */}
          <div
            className={`flex justify-center mb-16 transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/20 shadow-2xl">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDay(1)}
                  className={`px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    activeDay === 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-bold">Day 1</div>
                    <div className="text-xs opacity-80">June 26, 2025</div>
                  </div>
                  {activeDay === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveDay(2)}
                  className={`px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    activeDay === 2
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-bold">Day 2</div>
                    <div className="text-xs opacity-80">June 27, 2025</div>
                  </div>
                  {activeDay === 2 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            className={`relative transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
          >
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/50 transform md:-translate-x-px rounded-full shadow-lg"></div>

            <div className="space-y-12">
              {currentEvents.map((event, index) => {
                const Icon = event.icon
                const isLeft = index % 2 === 0
                const style = typeStyles[event.type]

                return (
                  <div
                    key={`${activeDay}-${index}`}
                    className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} flex-row`}
                    style={{ animationDelay: `${index * 150}ms` }}
                    onMouseEnter={() => setHoveredEvent(index)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-8 md:left-1/2 w-8 h-8 transform md:-translate-x-4 -translate-y-4 z-20">
                      <div
                        className={`w-8 h-8 rounded-full border-4 border-slate-900 shadow-2xl transition-all duration-300 ${
                          hoveredEvent === index ? "scale-125" : ""
                        } ${style.icon}`}
                      >
                        <div className="w-full h-full rounded-full animate-pulse opacity-50 bg-white/20"></div>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div
                      className={`ml-24 md:ml-0 w-full md:w-5/12 ${
                        isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"
                      }`}
                    >
                      <Card
                        className={`group bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden ${
                          event.featured ? "ring-2 ring-purple-500/50" : ""
                        }`}
                      >
                        {event.featured && (
                          <div className="absolute top-4 right-4 z-10">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}

                        <CardContent className="p-8">
                          <div className="flex items-start gap-6">
                            <div
                              className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg ${style.icon}`}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                    {event.title}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className={`text-sm font-medium ${style.bg} ${style.border} ${style.text}`}
                                  >
                                    {event.time}
                                  </Badge>
                                </div>

                                <Badge
                                  variant="outline"
                                  className={`text-xs ${style.border} ${style.text} bg-transparent`}
                                >
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                              </div>

                              <p className="text-gray-300 leading-relaxed text-base">{event.description}</p>

                              {(event.location || event.capacity) && (
                                <div className="flex flex-wrap gap-6 text-sm text-gray-400 pt-2">
                                  {event.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-purple-400" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                  {event.capacity && (
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-blue-400" />
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
                )
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div
            className={`mt-20 transition-all duration-1000 delay-800 ${isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Don&apos;t miss this opportunity to connect with industry leaders, develop new skills, and take the next step
                in your professional journey.
              </p>
<Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 font-semibold px-10 py-6 text-lg rounded-full shadow-2xl transition-all duration-300"
              >
                Register Now - It&apos;s Free!
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              </Link>
            </div>
          </div>

          {/* Important Notes */}
          <div
            className={`mt-16 transition-all duration-1000 delay-1000 ${isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Advance Registration</h4>
                <p className="text-sm text-gray-300">Register online for priority access and personalized ticket</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Punctuality Matters</h4>
                <p className="text-sm text-gray-300">Arrive 15 minutes early for scheduled sessions and interviews</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Professional Attire</h4>
                <p className="text-sm text-gray-300">Business professional dress code recommended for all events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-full h-24"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-slate-900"
          ></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </section>
  )
}
