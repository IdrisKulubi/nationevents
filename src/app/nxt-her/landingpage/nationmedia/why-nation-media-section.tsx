import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Globe, Award, Target, Megaphone, Heart, Scale, TrendingUp } from "lucide-react"

export function WhyNationMediaSection() {
  const points = [
    {
      icon: <div className="flex items-center gap-2"><Megaphone className="w-6 h-6" /><Heart className="w-6 h-6" /><Globe className="w-6 h-6" /></div>,
      text: "Largest independent media and digital content company in East & Central Africa. Global digital footprint as well as print and broadcast operations in Kenya, Uganda, Tanzania & Rwanda"
    },
    {
      icon: <div className="flex items-center gap-2"><Scale className="w-6 h-6" /></div>,
      text: "60-year legacy of championing truth, inclusion, and public interest journalism."
    },
    {
      icon: <div className="flex items-center gap-2"><Target className="w-6 h-6" /></div>,
      text: "Influence across policy, public opinion, and private sector thought leadership."
    },
    {
      icon: <div className="flex items-center gap-2"><Users className="w-6 h-6" /></div>,
      text: "A strong audience base of young, urban, and intergenerational Africans — making it the perfect convener."
    }
  ]

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Full-width Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/aesthetic-4.png"
          alt="Nation Media Group Background"
          fill
          className="object-cover brightness-75"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-opacity-40" />
      </div>

      {/* Decorative Border Pattern - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-repeat-y" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='40' viewBox='0 0 8 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4,0 L0,8 L4,16 L8,8 L4,0' fill='%23ffffff' opacity='0.3'/%3E%3C/svg%3E")`
           }}>
      </div>

      {/* Content Layout */}
      <div className="relative h-full flex items-center">
        <div className="w-full h-full flex mt-24">
          {/* Left Side - Title (1/2 width) */}
          <div className="w-1/2 h-full flex items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <div>Why</div>
                <div>Nation</div>
                <div>Media</div>
                <div>Group?</div>
              </h2>
            </div>
          </div>

          {/* Right Side - Points (1/2 width) */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="text-white space-y-8 w-full max-w-lg">
              {points.map((point, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 text-white">
                      {point.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg leading-relaxed">{point.text}</p>
                    </div>
                  </div>
                  {/* Horizontal line separator (except for last item) */}
                  {index < points.length - 1 && (
                    <div className="mt-8 w-full h-px bg-white bg-opacity-30"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
