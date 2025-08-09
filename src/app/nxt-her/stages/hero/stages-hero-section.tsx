
import Image from "next/image"

export function StagesHeroSection() {
  return (
    <section className="">
    <Image
      src="/images/woman2.jpg"
      alt="Woman with head tilted upwards, eyes closed, face illuminated by sunlight"
      fill
      className="object-cover rounded-lg"
    />
       
    <section className="relative w-full min-h-screen overflow-hidden bg-black/40 ">
      {/* Large semi-transparent text overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-9xl md:text-[12rem] lg:text-[16rem] font-bold text-white select-none">
          STAGES
        </h1>
      </div>

      {/* Content Layout */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full h-full flex">
          {/* Left Side - Empty for image to show through */}
          <div className="w-1/2 h-full relative">
            {/* Top-Left Image - Woman with head tilted upwards */}
            <div className="absolute top-18 left-8 w-80 h-96">
              <Image
                src="/images/woman2.jpg"
                alt="Woman with head tilted upwards, eyes closed, face illuminated by sunlight"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="w-1/2 h-full flex items-center justify-start pl-12 pr-8">
            <div className="max-w-2xl text-white space-y-8">
              {/* Navigation-style text */}
              
              {/* Main headline */}
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mt-6">
                Every stage tells a story
              </h2>
              
              {/* Description */}
              {/* <p className="text-lg leading-relaxed text-white/90 max-w-lg">
                Six intentional stages designed to elevate different dimensions of women's leadership, entrepreneurship, creativity, and policy work — while reflecting African identity, innovation, and sisterhood.
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-Right Image - Person lying down */}
      <div className="absolute bottom-8 right-8 w-96 h-64 z-15">
        <Image
          src="/images/woman3.png"
          alt="Person lying down on crumpled white sheet"
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Top Navigation */}
      {/* <div className="absolute top-8 left-8 right-8 z-30 flex justify-between items-center">
        <div className="text-white font-medium text-lg">STAGES</div>
        <div className="flex items-center space-x-8 text-white text-sm">
          <a href="#" className="hover:text-gray-300 transition-colors">HERizon Stage</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Mzizi Lab</a>
          <a href="#" className="hover:text-gray-300 transition-colors">The Circle</a>
        </div>
      </div> */}
    </section>
    </section>
  )
}


