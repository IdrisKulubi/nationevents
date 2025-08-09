import { Attendee } from "../types/attendee"
import Image from "next/image"

interface HeroSectionProps {
  attendees: Attendee[]
}

export function HeroSection({ attendees }: HeroSectionProps) {
  const inPersonCount = attendees.filter(a => a.attendanceType === 'in-person').length
  const virtualCount = attendees.filter(a => a.attendanceType === 'virtual').length
  const countries = [...new Set(attendees.map(a => a.country))]

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/woman2.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Geometric Pattern Border */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Who's
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                There
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl max-w-2xl leading-relaxed opacity-90">
              Connect with {attendees.length} amazing women leaders, entrepreneurs, and changemakers from across Africa and beyond.
            </p>
            
            {/* Stats */}
            {/* <div className="flex flex-wrap gap-6 text-lg">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="font-bold text-2xl text-blue-300">{inPersonCount}</span>
                <span className="ml-2 text-white/80">In-Person</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="font-bold text-2xl text-blue-300">{virtualCount}</span>
                <span className="ml-2 text-white/80">Virtual</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="font-bold text-2xl text-blue-300">{countries.length}</span>
                <span className="ml-2 text-white/80">Countries</span>
              </div>
            </div> */}
          </div>

          {/* Right Side - Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/woman3.png"
                    alt="Attendee"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/woman4.png"
                    alt="Attendee"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/woman5.png"
                    alt="Attendee"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/woman1.jpg"
                    alt="Attendee"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 