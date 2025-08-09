import Image from "next/image"

export function StageDetailsSection() {
  const stages = [
    {
      name: "HERizon Stage",
      subtitle: "MAIN STAGE",
      description:
        "Each day begins in the Main Plenary, a dynamic gathering that unites the entire summit community for high‑impact conversations and inspiration. Here, feminist icons, emerging innovators, policy makers, creatives, and grassroots leaders share the stage through keynote panels, TED‑style talks, fireside chats, and rapid‑fire lightning speeches. Audiences are immersed in powerful storytelling, cross‑generational dialogues, and thought‑provoking performances that blend art, culture, and activism. ",
        
      formats: [
          "Keynote Panels",
          "TED-Style Talks",
          "Fireside Chats",
          "Lightning Talks",
          "Special Features (e.g. Award Ceremony or In-Memoriam Tribute)",
        ],
        example: "Shaping Power: African Women in Global Leadership – a dynamic conversation with Heads of State, CEOs, and diplomats.",
        image: "/images/woman3.png",
    },
    // {
    //   name: "Mzizi Lab",
    //   subtitle: "STARTUP STAGE",
    //   description: "To showcase and support startups and innovations led by African women across all sectors.",
    //   formats: [
    //     "Live Startup Demos",
    //     "Investor Pitch Showcases", 
    //     "Founder Spotlights",
    //     "Lightning Talks",
    //   ],
    //   example: "Women-led Tech Innovation Showcase – featuring cutting-edge solutions from African women entrepreneurs.",
    //   image: "/images/woman3.png",
    // },
    {
      name: "The Circle",
      subtitle: "ROUNDTABLE ROOM",
      description:
        "Intimate and unfiltered roundtables for intergenerational exchange, policy dialogue, and collaborative visioning.",
      formats: [
        "Curated Roundtables",
        "Interactive Think Tanks",
        "Policy Dialogues",
      ],
      example: "Intergenerational Leadership Exchange – bridging wisdom between established leaders and emerging voices.",
      image: "/images/woman4.png",
    },
    // {
    //   name: "The Vibe Studio",
    //   subtitle: "CREATIVE ECONOMY STAGE",
    //   description: "Centering women creators, storytellers, cultural curators, and digital entrepreneurs.",
    //   formats: [
    //     "Panel Discussions",
    //     "Masterclasses (e.g on monetization, branding, digital storytelling)",
    //     "Artistic Features",
    //   ],
    //   example: "Rewriting HERstory Through Art – celebrating African women's creative contributions and cultural impact.",
    //   image: "/images/woman5.png",
    // },
    // {
    //   name: "The Forge",
    //   subtitle: "WORKSHOP STAGE",
    //   description:
    //     "Skill-building workshops and hands-on learning across leadership, finance, digital tools, and self-mastery.",
    //   formats: [
    //     "Guided Workshops",
    //     "Trainings",
    //     "Masterclasses",
 
    //   ],
    //   example: "Digital Leadership Masterclass – empowering women with essential digital skills for modern leadership.",
    //   image: "/images/woman3.png",
    // },
    // {
    //   name: "The Deal Room",
    //   subtitle: "INVESTOR LOUNGE",
    //   description: "High-impact networking between women-led ventures and investors, philanthropies, or accelerators.",
    //   formats: [
    //     "Curated One-on-One Investor Meetings",
    //     "Fireside Chats with Fund Managers",
    //     "Sector-Focused Pitches",
    //   ],
    //   example: "African Women Entrepreneurs Meet Investors – creating pathways for funding and growth opportunities.",
    //   image: "/images/woman2.jpg",
    // },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {stages.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex min-h-[500px] relative">
                {/* Alternate layout based on index */}
                {index % 2 === 0 ? (
                  <>
                    {/* Left Side - Blue Background with Content (2/3 width) */}
                    <div className="w-2/3 bg-[#0875b6] p-8 flex flex-col justify-center relative z-10">
                      <div className="text-white space-y-6">
                        {/* Subtitle */}
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-white">{stage.subtitle}</h3>
                          <div className="w-16 h-0.5 bg-white mb-4"></div>
                        </div>

                        {/* Main Title */}
                        <div>
                          <h2 className="text-4xl font-bold">
                            <span className="text-blue-300">{stage.name.split(' ')[0]}</span>
                            <span className="text-white"> {stage.name.split(' ').slice(1).join(' ')}</span>
                          </h2>
                        </div>

                        {/* Description */}
                        <p className="text-lg leading-relaxed text-blue-100">
                          {stage.description}
                        </p>

                        {/* Formats */}
                        <div>
                          <h4 className="font-bold text-lg mb-3 text-white">Formats:</h4>
                          <ul className="space-y-2">
                            {stage.formats.map((format, formatIndex) => (
                              <li key={formatIndex} className="flex items-start">
                                <span className="text-white mr-3 mt-1">•</span>
                                <span className="font-bold text-white">{format}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Example Session */}
                        {/* <div className="pt-4">
                          <h4 className="font-bold uppercase text-sm mb-2 text-white">EXAMPLE SESSION</h4>
                          <p className="italic text-blue-100">"{stage.example}"</p>
                        </div> */}
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px bg-white z-10"></div>

                    {/* Right Side - White Background with Image (1/3 width) */}
                    <div className="w-1/3 bg-white relative">
                      <Image
                        src={stage.image}
                        alt={stage.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Side - White Background with Image (1/3 width) */}
                    <div className="w-1/3 bg-white relative">
                      <Image
                        src={stage.image}
                        alt={stage.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px bg-white z-10"></div>

                    {/* Right Side - Blue Background with Content (2/3 width) */}
                    <div className="w-2/3 bg-[#0875b6] p-8 flex flex-col justify-center relative z-10">
                      <div className="text-white space-y-6">
                        {/* Subtitle */}
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-white">{stage.subtitle}</h3>
                          <div className="w-16 h-0.5 bg-white mb-4"></div>
                        </div>

                        {/* Main Title */}
                        <div>
                          <h2 className="text-4xl font-bold">
                            <span className="text-blue-300">{stage.name.split(' ')[0]}</span>
                            <span className="text-white"> {stage.name.split(' ').slice(1).join(' ')}</span>
                          </h2>
                        </div>

                        {/* Description */}
                        <p className="text-lg leading-relaxed text-blue-100">
                          {stage.description}
                        </p>

                        {/* Formats */}
                        {/* <div>
                          <h4 className="font-bold text-lg mb-3 text-white">Formats:</h4>
                          <ul className="space-y-2">
                            {stage.formats.map((format, formatIndex) => (
                              <li key={formatIndex} className="flex items-start">
                                <span className="text-white mr-3 mt-1">•</span>
                                <span className="font-bold text-white">{format}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
 */}
                        {/* Example Session */}
                        {/* <div className="pt-4">
                          <h4 className="font-bold uppercase text-sm mb-2 text-white">EXAMPLE SESSION</h4>
                          <p className="italic text-blue-100">"{stage.example}"</p>
                        </div> */}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
