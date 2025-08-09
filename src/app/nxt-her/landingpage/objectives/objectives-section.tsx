// "use client"

// import { ClipboardCheck, Megaphone, MessageSquare, Users, TrendingUp } from "lucide-react"

// const objectives = [
//   { 
//     icon: <ClipboardCheck className="w-6 h-6" />, 
//     title: "Evaluate Progress",
//     description: "Assess the impact of Beijing+30 initiatives and measure progress towards gender equality goals across Africa"
//   },
//   { 
//     icon: <Megaphone className="w-6 h-6" />, 
//     title: "Amplify Media Role",
//     description: "Highlight the critical role of media in shaping narratives and driving social change for women's empowerment"
//   },
//   { 
//     icon: <MessageSquare className="w-6 h-6" />, 
//     title: "Intergenerational Dialogue",
//     description: "Foster meaningful conversations between different generations of women leaders and activists"
//   },
//   { 
//     icon: <Users className="w-6 h-6" />, 
//     title: "Cross-sector Outcomes",
//     description: "Create actionable outcomes that span across media, policy, business, and civil society sectors"
//   },
//   { 
//     icon: <TrendingUp className="w-6 h-6" />, 
//     title: "Celebrate Storytellers",
//     description: "Recognize and amplify the voices of women who are changing narratives through storytelling and media"
//   }
// ]

// export default function ObjectivesSection() {
//   const radius = 280
//   const center = 350
//   const angleStep = (2 * Math.PI) / objectives.length

//   return (
//     <section className="bg-gradient-to-br from-pink-700 to-blue-800 py-20 flex justify-center items-center min-h-screen">
//       <div className="relative w-[900px] h-[900px]">
//         {/* Central Title */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-blue-800 px-10 py-8 rounded-full shadow-lg z-10">
//           <div className="text-2xl font-bold text-center">Summit</div>
//           <div className="text-xl font-semibold text-center">Objectives</div>
//         </div>
        
//         {/* Objectives positioned around the circle */}
//         {objectives.map((o, i) => {
//           const angle = i * angleStep
//           const x = center + radius * Math.cos(angle) - 100
//           const y = center + radius * Math.sin(angle) - 60
//           return (
//             <div
//               key={i}
//               className="absolute w-56 h-auto flex flex-col items-center text-white text-center"
//               style={{ left: x, top: y }}
//             >
//               {/* Icon Container */}
//               <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full mb-4 border border-white/30">
//                 {o.icon}
//               </div>
              
//               {/* Title */}
//               <h3 className="text-base font-bold mb-3 leading-tight">{o.title}</h3>
              
//               {/* Description */}
//               <p className="text-sm leading-relaxed opacity-90 max-w-48">
//                 {o.description}
//               </p>
//             </div>
//           )
//         })}
        
//         {/* Connecting Lines */}
//         <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
//           <circle
//             cx={center}
//             cy={center}
//             r={radius}
//             fill="none"
//             stroke="rgba(255,255,255,0.2)"
//             strokeWidth="2"
//             strokeDasharray="5,5"
//           />
//         </svg>
//       </div>
//     </section>
//   )
// }


"use client"

import { useState } from "react"
import { ClipboardCheck, Megaphone, MessageSquare, Users, TrendingUp } from "lucide-react"

const objectives = [
  {
    icon: <ClipboardCheck className="w-8 h-8" />,
    text: "Evaluate progress made since the 1995 Beijing Platform for Action (BPfA)"
  },
  {
    icon: <Megaphone className="w-8 h-8" />,
    text: "Amplify the role of media in advancing gender equality across critical areas"
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    text: "Foster intergenerational dialogue and action on women's rights and leadership"
  },
  {
    icon: <Users className="w-8 h-8" />,
    text: "Create tangible cross-sector policy and advocacy outcomes"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    text: "Celebrate, connect and uplift African women storytellers, innovators and change agents"
  }
]

export default function ObjectivesFlipCards() {
  return (
    <section className="bg-gradient-to-b from-pink-700 to-blue-800 py-16 px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {objectives.map((o, i) => (
          <div
            key={i}
            className="group perspective w-full h-48"
          >
            <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d group-hover:rotate-y-180">
              <div className="absolute w-full h-full bg-white/10 text-white flex items-center justify-center rounded-xl backface-hidden">
                {o.icon}
              </div>
              <div className="absolute w-full h-full bg-white/20 text-white p-4 text-center flex items-center justify-center rounded-xl rotate-y-180 backface-hidden">
                <p className="text-sm font-medium">{o.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  )
}
