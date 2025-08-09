"use client"

import Image from "next/image"

export function WomenMediaSection() {
  const sections = [
    {
      layout: "three" as const, // image text image
      title: "EDUCATION & TRAINING OF WOMEN",
      description:
        "Closing literacy gaps, advancing digital proficiency, and fostering the skills women need to excel in an increasingly dynamic and technology‑driven world.",
      leftImage: "/woman1.jpg",
      rightImage: "/images/woman2.jpg",
      borderColor: "border-white/30"
    },
    {
      layout: "two" as const, // text image
      title: "WOMEN & HEALTH",
      description:
        "Spotlighting mental health, advancing reproductive justice, and championing FemTech,women‑led innovations transforming healthcare.",
      image: "/images/woman3.png",
      borderColor: "border-white/30"
    },
    {
      layout: "two-reverse" as const, // image text
      title: "WOMEN & THE ECONOMY",
      description:
        "Empowering women to navigate access to capital, achieve financial independence, and drive entrepreneurship.",
      image: "/images/woman4.png",
      borderColor: "border-white/30"
    },
    {
      layout: "three" as const, // image text image
      title: "WOMEN & DECISION-MAKING",
      description:
        "Disrupting systemic barriers, fostering strong coalitions, and elevating women’s voices in leadership and decision‑making.",
      leftImage: "/images/woman5.png",
      rightImage: "/images/woman2.jpg",
      borderColor: "border-white/30"
    },
  ]

  return (
    <section className="bg-gradient-to-r from-blue-100 via-gray-100 to-blue-50 py-16">
      <div className="w-full">
        {sections.map((section, index) => {
          if (section.layout === "three") {
            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch max-w-none p-4"
              >
                {/* Left image card */}
                <div className="h-80 overflow-hidden rounded-xl border border-white/20 shadow-lg bg-white">
                  <Image
                    src={section.leftImage}
                    alt={section.title}
                    width={400} 
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Text block card */}
                <div className="relative h-80">
                  {/* Blurred background - exact effect from image */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl"></div>
                  {/* Text content on top */}
                  <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                    <h2 className="text-3xl font-bold mb-4 text-black leading-tight">{section.title}</h2>
                    <p className="text-black leading-relaxed text-lg">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Right image card */}
                <div className="h-80 overflow-hidden rounded-xl border border-white/20 shadow-lg bg-white">
                  <Image
                    src={section.rightImage}
                    alt={section.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )
          }

          if (section.layout === "two") {
            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch max-w-none p-4"
              >
                {/* Text block card */}
                <div className="relative h-80">
                  {/* Blurred background - exact effect from image */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl"></div>
                  {/* Text content on top */}
                  <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                    <h2 className="text-3xl font-bold mb-4 text-black leading-tight">{section.title}</h2>
                    <p className="text-black leading-relaxed text-lg">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Image card */}
                <div className="h-80 overflow-hidden rounded-xl border border-white/20 shadow-lg bg-white">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )
          }

          if (section.layout === "two-reverse") {
            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-1 items-stretch max-w-none p-4"
              >
                {/* Image card */}
                <div className="h-80 overflow-hidden rounded-xl border border-white/20 shadow-lg ">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Text block card */}
                <div className="relative h-80">
                  {/* Blurred background - exact effect from image */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl"></div>
                  {/* Text content on top */}
                  <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                    <h2 className="text-3xl font-bold mb-4 text-black leading-tight">{section.title}</h2>
                    <p className="text-black leading-relaxed text-lg">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </section>
  )
}
