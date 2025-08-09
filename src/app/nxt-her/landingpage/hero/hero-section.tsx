

"use client"

import Image from "next/image"

const heroImages = [
  "/women/Picture15.png",
  "/images/woman2.jpg",
  "/images/woman3.png",
  "/images/woman4.png",
]

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans">
      {/* Background Image Columns */}
      <div className="absolute inset-0 flex">
        {heroImages.map((src, index) => (
          <div key={index} className="relative w-1/4 h-full">
            <Image
              src={src}
              alt={`Panel ${index + 1}`}
              fill
              className="object-cover brightness-75"
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0  bg-opacity-30 z-10" />

      {/* Hero Text Positioned */}
      <div className="absolute inset-0 z-20 flex items-center px-6">
        <div className="w-full h-full flex items-center">
          {/* Left Text - NXT HERizon Summit (spans first two segments) */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div >
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-extrabold text-blue-500 leading-none">
                NXT
              </div>
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-extrabold text-blue-500 leading-none">
                HER<span className="text-blue-500">izon</span> Summit
              </div>
            </div>
          </div>

          {/* Right Text - BEIJING +30 (positioned over third segment) */}
          <div className="w-1/4 h-full flex items-center justify-end pr-4">
            <div className="text-right">
              <div className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <div>BEIJING</div>
                <div className="flex items-center justify-end gap-2">
                  <span>+30</span>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
