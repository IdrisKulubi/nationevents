"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Twitter, Globe, MapPin, MessageCircle, Mail } from "lucide-react"
import { Attendee } from "../types/attendee"

interface AttendeeCardProps {
  attendee: Attendee
}

export function AttendeeCard({ attendee }: AttendeeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleWhatsAppContact = (phone: string, name: string) => {
    const message = `Hi ${name}, I found your profile on the NXT HERizon Summit attendee directory. I'd love to connect!`
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <>
      <div className="group relative cursor-pointer w-80 h-96">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl h-full">
          {/* Image Container */}
          <div className="relative h-full">
            <Avatar className="w-full h-full rounded-2xl">
              <AvatarImage src={attendee.photo} alt={`${attendee.firstName} ${attendee.lastName}`} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-slate-600 text-white text-4xl font-semibold rounded-2xl">
                {attendee.firstName[0]}{attendee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Hover Overlay with "Full Info" text */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="text-white text-xl font-bold">Full Info</div>
            </div>
            
            {/* Social Icons at bottom left */}
          </div>
          
          {/* Name and Title overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-lg font-bold text-white mb-1">
              {attendee.firstName.toUpperCase()} {attendee.lastName.toUpperCase()}
            </h3>
            <p className="text-sm text-white/90">
              {attendee.title} at {attendee.organization}
            </p>
          </div>
        </div>
        
        {/* Click handler */}
        <div 
          className="absolute inset-0 z-10" 
          onClick={() => setIsModalOpen(true)}
        ></div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={attendee.photo} alt={`${attendee.firstName} ${attendee.lastName}`} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-slate-600 text-white text-lg font-semibold">
                      {attendee.firstName[0]}{attendee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{attendee.firstName} {attendee.lastName}</h2>
                  <p className="text-gray-600">{attendee.title} at {attendee.organization}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{attendee.city ? `${attendee.city}, ` : ''}{attendee.country}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Biography</h3>
                <p className="text-gray-700 leading-relaxed">{attendee.bio}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {attendee.expertise.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {attendee.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row space-y-2">
                {attendee.linkedinUrl && (
                  <button className="w-full  text-white py-3 px-4 rounded font-semibold transition-colors flex items-center justify-center">
                    <Linkedin className="w-4 h-4 mr-2 text-[#0875b6]" />
                  </button>
                )}
                {attendee.twitterUrl && (
                  <button className="w-full text-white py-3 px-4 rounded font-semibold    transition-colors flex items-center justify-center">
                    <Twitter className="w-4 h-4 mr-2 text-[#0875b6]" />
                  </button>
                )}
                {attendee.websiteUrl && (
                  <button className="w-full  text-white py-3 px-4 rounded font-semibold transition-colors flex items-center justify-center">
                    <Globe className="w-4 h-4 mr-2 text-[#0875b6]" />
                  </button>
                )}
                {attendee.phone && (
                  <button 
                    className="w-full text-white py-3 px-4 rounded font-semibold transition-colors flex items-center justify-center"
                    onClick={() => handleWhatsAppContact(attendee.phone!, `${attendee.firstName} ${attendee.lastName}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-[#0875b6]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 