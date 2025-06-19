"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Calendar, Clock, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function Conference3DCard() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-white/5 relative group/card hover:shadow-2xl hover:shadow-purple-500/[0.1] backdrop-blur-xl border border-white/10 w-auto sm:w-[30rem] h-auto rounded-xl p-6">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-white mb-2"
        >
          Pre-Job Fair Conference
        </CardItem>
        
        <CardItem
          as="p"
          translateZ="60"
          className="text-gray-300 text-sm max-w-sm mt-2 mb-4"
        >
          Join industry experts and professionals for an inspiring day of learning, networking, and career development.
        </CardItem>

        <CardItem translateZ="80" className="mb-4">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Star className="w-3 h-3 mr-1" />
            Featured Event
          </Badge>
        </CardItem>

        <CardItem translateZ="100" className="w-full mt-4">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/business-team.jpg"
              height="200"
              width="400"
              className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl transition-transform duration-500 group-hover/card:scale-105"
              alt="Conference networking"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-sm font-medium">Network & Learn Together</p>
            </div>
          </div>
        </CardItem>

        <CardItem translateZ="70" className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Same Day as Job Fair</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Morning Session</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Open to Everyone</span>
          </div>
        </CardItem>

        <div className="flex justify-between items-center mt-6">
          <CardItem
            translateZ={20}
            as="span"
            className="px-4 py-2 rounded-xl text-xs font-normal text-green-300 bg-green-500/20"
          >
            Free Attendance
          </CardItem>
         
        </div>
      </CardBody>
    </CardContainer>
  );
} 