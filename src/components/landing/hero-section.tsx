'use client';

import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse opacity-20"></div>
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl animate-pulse opacity-15" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl animate-bounce opacity-10" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            {/* Event Badge */}
            <div className={`inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm font-medium transition-all duration-1000 hover:bg-white/10 hover:scale-105 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Catalyzing Kenya&apos;s Job Sector</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Nation-Huawei
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Leap Job
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Fair
                </span>
              </h1>
              
              <p className={`text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                A bold partnership between Nation Media Group and Huawei Technologies to bridge the talent in Kenya with businesses that need it, inspiring a generation of professionals to reach their utmost potential.
              </p>
            </div>

            {/* Event Details */}
            <div className={`grid md:grid-cols-3 gap-4 py-6 transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Date</p>
                  <p className="text-xs text-gray-300">Jun 26, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <MapPin className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Venue</p>
                  <p className="text-xs text-gray-300">University of Nairobi Graduation Square</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Time</p>
                  <p className="text-xs text-gray-300">8:30am - 4:30pm</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-800 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <Link href="/login">
                  Register Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-white transition-all duration-300 transform hover:scale-105 bg-transparent"
              >
                <Link href="#about">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-3 gap-8 pt-8 border-t border-white/10 transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">50+</p>
                <p className="text-sm text-gray-300">Companies</p>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">100+</p>
                <p className="text-sm text-gray-300">Opportunities</p>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">1</p>
                <p className="text-sm text-gray-300">Day</p>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'animate-fade-in-right opacity-100' : 'opacity-0'}`}>
            <div className="space-y-6">
              {/* Main Professional Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image
                      src="/job.png"
                      alt="Professional Team"
                      width={400}
                      height={300}
                      className="object-cover w-full h-64 hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-1">Connect with Top Employers</h3>
                      <p className="text-gray-300 text-sm">Meet industry leaders and discover your next career opportunity</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Business Team Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="/business-team.jpg"
                      alt="Business Networking"
                      width={400}
                      height={200}
                      className="object-cover w-full h-40 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-medium">Network & Grow Together</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partnership Logos */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <Image
                        src="/huawei-logo.png"
                        alt="Huawei"
                        width={100}
                        height={40}
                        className="object-contain mx-auto opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="px-4">
                      <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <Image
                        src="/nationlogo.png"
                        alt="Nation Media Group"
                        width={250}
                        height={70}
                        className="object-contain mx-auto opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-xs text-gray-400">Powered by Strategic Partnership</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
} 