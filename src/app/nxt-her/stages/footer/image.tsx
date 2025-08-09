"use client";

import React from 'react';
import Image from 'next/image';
import { Star, Lightbulb, BarChart3, Users } from 'lucide-react';

const ImageComponent: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent">
        <div className="absolute inset-0">
        <Image 
        src="/women/Picture9.png"
        alt="Background"
        fill
        className="object-cover"
        />
        </div>
      </div>

      {/* Main text overlay */}
      <div className="absolute top-40 left-16 z-20">
        <h1 className="text-7xl font-bold text-white leading-tight">
          Intentionally<br />designed to
        </h1>
      </div>

      {/* African woman silhouette */}

      {/* Four purpose sections */}
      <div className="absolute bottom-40 left-0 right-0 flex justify-between px-16 z-20">
        {/* Section 1: Spotlight */}
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            {/* Three stars */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
              <Star className="w-10 h-10 text-yellow-400 fill-current" />
            </div>
          </div>
          <p className="text-white text-lg leading-relaxed">
            Spotlight African women's bold leadership, creativity and entrepreneurship
          </p>
        </div>

        {/* Section 2: Drive solutions */}
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            <Lightbulb className="w-12 h-12 text-yellow-400 fill-current" />
          </div>
          <p className="text-white text-lg leading-relaxed">
            Drive sector-specific solutions across the 4 critical areas
          </p>
        </div>

        {/* Section 3: Blend data */}
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-white text-lg leading-relaxed">
            Blend data, story, and practice to enable reflection and mobilization
          </p>
        </div>

        {/* Section 4: Deliver programming */}
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            <Users className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-white text-lg leading-relaxed">
            Deliver programming with both scale and intimacy, ensuring voices from grassroots to global spaces are represented
          </p>
        </div>
      </div>

      {/* Navigation bar */}
    </div>
  );
};

export default ImageComponent;
