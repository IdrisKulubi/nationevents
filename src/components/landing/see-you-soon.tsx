'use client';

import { Calendar, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Ballpit to avoid SSR issues
const Ballpit = dynamic(() => import('./see-you'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse" />
  )
});

export function SeeYouSoon() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('see-you-soon');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="see-you-soon"
      className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      
      {/* Full Width Ballpit Container */}
      <div className="relative w-full h-[350px]">
        {/* Ballpit Effect - Full Width Background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <Ballpit
            count={120}
            gravity={0.7}
            friction={0.8}
            wallBounce={0.95}
            followCursor={true}
            colors={[0x8b5cf6, 0xec4899, 0x06b6d4]}
          />
        </div>
        
        {/* Overlay Content - Centered on Ballpit */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/10 to-black/30 pointer-events-none">
          <div className="text-center space-y-8 px-6 max-w-6xl mx-auto">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full px-8 py-4 text-base font-medium transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">Mark Your Calendar</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold leading-tight transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-2xl">
                  See You On
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
                  July 8th
                </span>
              </h1>
              
              <p className={`text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 drop-shadow-lg font-light ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
                Don&apos;t miss this incredible opportunity to connect with top employers and accelerate your career journey.
              </p>
            </div>

            {/* Interactive Hint */}
            <div className={`mt-8 transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <p className="text-white/80 text-lg bg-white/10 backdrop-blur-xl rounded-full px-8 py-3 border border-white/20 font-medium">
                ✨ Move your cursor to interact with the spheres
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-10 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-10 blur-xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
    </section>
  );
} 