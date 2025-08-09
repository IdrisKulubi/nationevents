"use client"

import Image from "next/image"

export default function TwoDaysSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image - Full Coverage */}
      <div className="absolute inset-0">
        <Image
          src="/women/Picture10.png"
          alt="Sunset field with woman looking towards the sun"
          fill
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Layout */}
      <div className="relative h-full flex items-center justify-center mt-20">
        <div className="w-full h-full flex">
          {/* Left Side - Empty for image to show through */}
          <div className="w-1/4 h-full"></div>

          {/* Right Side - Text Content */}
          <div className="w-3/4 h-full flex items-center justify-end pr-8 pl-8">
            <div className="max-w-4xl text-white text-right">
              {/* Main Title - Larger and properly sized */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight text-white">
                <div className="mb-2">TWO DAYS</div>
                <div className="mb-2">ONE MISSION</div>
                <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl">A THOUSAND POSSIBILITIES</div>
              </h1>

              {/* Body Text */}
              <div className="space-y-4 md:space-y-6 text-lg md:text-xl leading-relaxed text-white mt-8 md:mt-12">
                <p>
                  This summit is not just a gathering — it's a time capsule and a launchpad.
                </p>
                
                <p>
                  Our structure, split across two immersive days, reflects women's journey over the past thirty years while boldly envisioning the next thirty.
                </p>
                
                <p>
                  Each day is built to ground us in context and propel us into action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


