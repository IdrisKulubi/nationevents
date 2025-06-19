'use client';

import { Button } from "@/components/ui/button";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-nation-gradient rounded-full blur-xl animate-bounce-gentle opacity-20"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-huawei-gradient rounded-full blur-2xl animate-bounce-gentle opacity-15" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            {/* Event Badge */}
            <div className={`inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm font-medium transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="w-2 h-2 bg-huawei-gradient rounded-full animate-pulse"></div>
              <span className="text-slate-600 dark:text-slate-300">Catalyzing Kenya&apos;s Job Sector</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                  Nation-Huawei
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  Leap Job
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  Fair
                </span>
              </h1>
              
              <p className={`text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                A bold partnership between Nation Media Group and Huawei Technologies to bridge the talent in Kenya with businesses that need it, inspiring a generation of professionals to reach their utmost potential.
              </p>
            </div>

            {/* Event Details */}
            <div className={`grid md:grid-cols-3 gap-4 py-6 transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <Calendar className="w-5 h-5 text-[var(--huawei-red)]" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Date</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Jun 26-27, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-5 h-5 text-[var(--nation-blue)]" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Venue</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">University of Nairobi Graduation Square</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <Users className="w-5 h-5 text-[var(--huawei-red)]" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Time</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">9am - 4pm Daily</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-800 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <Button 
                asChild
                size="lg" 
                className="bg-huawei-gradient hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
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
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <Link href="#about">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-3 gap-8 pt-8 border-t border-slate-200 dark:border-slate-700 transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">50+</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">500+</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Opportunities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">2</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Days</p>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'animate-fade-in-right opacity-100' : 'opacity-0'}`}>
            <div className="relative">
              {/* Main logos container */}
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                {/* Huawei Logo */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <Image
                      src="/huaweilogo.png"
                      alt="Huawei"
                      width={200}
                      height={80}
                      className="object-contain"
                      priority
                    />
                    <div className="absolute inset-0 bg-huawei-gradient opacity-20 rounded-lg blur-xl"></div>
                  </div>
                </div>

                {/* Partnership Badge */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1"></div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-3">In Partnership With</span>
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1"></div>
                </div>

                {/* Nation Media Logo */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src="/nationlogo.png"
                      alt="Nation Media Group"
                      width={180}
                      height={70}
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-nation-gradient opacity-20 rounded-lg blur-xl"></div>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-huawei-gradient rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-nation-gradient rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 