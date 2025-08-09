"use client"

import Image from "next/image"

export function LegacyImpactSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans">
      {/* Background Image - Full Coverage */}
      <div className="absolute inset-0">
        <Image
          src="/women/Picture13.png"
          alt="African women and traditional crafts background"
          fill
          className="object-cover brightness-50"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Positioned */}
      <div className="absolute inset-0 z-20 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full h-full flex items-center">
          {/* Left Side - Empty for image to show through */}
          <div className="w-1/2 h-full"></div>

          {/* Right Side - Text Content */}
          <div className="w-1/2 h-full flex items-center justify-end pr-4 sm:pr-8 pl-4 sm:pl-8">
            <div className="max-w-3xl text-right">
              {/* Main Title - Responsive and properly sized */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight">
                <div className="mb-2">GROUNDED IN LEGACY</div>
                <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#0875b6] mt-4  ">DESIGNED FOR IMPACT</div>
              </h2>

              <div className="space-y-4 md:space-y-6 text-white text-base md:text-lg leading-relaxed">
                <p>
                  The summit draws on the <span className="text-[#0875b6] font-semibold">1995 Beijing Declaration's</span> landmark framework for women's rights, distilling its 12 critical areas of concern into five strategic pillars that reflect the evolving realities, challenges, and achievements of African women today.
                </p>

                <div className="p-4 md:p-6 rounded-lg border border-white/20 mt-6 md:mt-8">
                  <p className="text-base md:text-lg font-semibold text-white">
                    At the heart of these is our anchor pillar:
                  </p>
                  <p className="text-lg md:text-xl  mt-2">
                    <strong className="text-[#0875b6]">Women & the Media</strong> — recognizing the media's unique power to shape narratives, amplify voices, and influence policy, perception, and power.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 