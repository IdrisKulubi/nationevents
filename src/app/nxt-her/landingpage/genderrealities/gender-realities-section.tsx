"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Users, Shield, Globe, TrendingUp, Crown } from "lucide-react"
import { useState, useEffect } from "react"

export function GenderRealitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const realities = [
    {
      icon: <Users className="w-8 h-8 md:w-12 md:h-12" />,
      area: "Media Representation",
      reality: "Only 20% of editors-in-chief in African newsrooms are women. Women are quoted more in 'soft news' (lifestyle, family) than in economics or politics.",
      source: "African Women in Media, 2022",
      stat: "20%",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <Shield className="w-8 h-8 md:w-12 md:h-12" />,
      area: "Health Access",
      reality: "Sub-Saharan Africa accounts for 66% of global maternal deaths. Access to reproductive health info is lower among women with no media exposure.",
      source: "WHO, 2023",
      stat: "66%",
      color: "from-slate-400 to-slate-600"
    },
    {
      icon: <Globe className="w-8 h-8 md:w-12 md:h-12" />,
      area: "Education & Digital Literacy",
      reality: "In Sub-Saharan Africa, women are 30-50% less likely to use the internet than men. This digital divide widens among youth.",
      source: "GSMA Mobile Gender Gap Report, 2023",
      stat: "30-50%",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8 md:w-12 md:h-12" />,
      area: "Economic Power",
      reality: "Women contribute over 40% to Africa's GDP yet receive less than 10% of credit.",
      source: "African Development Bank, 2022",
      stat: "40%",
      color: "from-cyan-400 to-cyan-600"
    },
    {
      icon: <Crown className="w-8 h-8 md:w-12 md:h-12" />,
      area: "Leadership & Decision-making",
      reality: "Women hold only 24% of seats in national parliaments across Africa. Female political coverage is still heavily gendered.",
      source: "UN Women, 2023",
      stat: "24%",
      color: "from-blue-500 to-blue-700"
    },
  ]

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % realities.length)
          setIsTransitioning(false)
        }, 300)
      }
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [realities.length, isTransitioning])

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % realities.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + realities.length) % realities.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  // Get the 3 cards to display with wrap-around
  const getVisibleCards = () => {
    const cards = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % realities.length
      cards.push(realities[index])
    }
    return cards
  }

  const visibleCards = getVisibleCards()

  return (
    <section className="relative py-16 md:py-30 overflow-hidden">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,200 C300,100 600,300 1200,200 L1200,400 L0,400 Z"
              fill="url(#blueGradient)"
              opacity="0.1"
            />
            <path
              d="M0,250 C400,150 800,350 1200,250 L1200,400 L0,400 Z"
              fill="url(#indigoGradient)"
              opacity="0.15"
            />
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#4338ca', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            PAN-AFRICAN GENDER REALITIES
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding the current landscape of women's progress and challenges across Africa provides the foundation
            for our collective action.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Smooth Sliding Cards Container */}
          <div className="overflow-hidden">
            <div 
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-16 transition-all duration-700 ease-in-out ${
                isTransitioning ? 'transform -translate-x-8 opacity-70' : 'opacity-100'
              }`}
            >
              {visibleCards.map((reality, index) => (
                <Card 
                  key={`${currentIndex}-${index}`} 
                  className={`bg-white/90 backdrop-blur-sm border-0 shadow-2xl h-80 md:h-96 transition-all duration-700 ease-in-out hover:scale-105 ${
                    index === 0 ? 'animate-slideIn' : ''
                  }`}
                >
                  <CardContent className="p-4 md:p-6 h-full flex flex-col justify-center">
                    <div className="text-center mb-4 md:mb-6">
                      <div className={`inline-flex p-3 md:p-4 rounded-full bg-gradient-to-r ${reality.color} text-white mb-3 md:mb-4 shadow-lg`}>
                        {reality.icon}
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                        {reality.area}
                      </h3>
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-3">
                        {reality.stat}
                      </div>
                    </div>
                    
                    <div className="text-center mb-4 flex-1">
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                        {reality.reality}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium">
                        {reality.source}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.7s ease-out;
        }
      `}</style>
    </section>
  )
}
