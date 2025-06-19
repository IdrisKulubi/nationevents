"use client";

import Link from "next/link";
import { Plus, Calendar, Users, Star, MapPin, FileText, BarChart, Clock, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickActionsProps {
  employerId: string;
}

export function QuickActions({ employerId }: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-bold">
          <Zap className="h-5 w-5 mr-2" />
          ⚡ Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 border-2 border-gray-200 shadow-xl rounded-xl">
        <DropdownMenuLabel className="text-lg font-bold text-gray-900 px-3 py-2">
          🚀 Create & Manage
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/booths" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">🏢 Booth Setup</p>
              <p className="text-xs text-gray-600">Configure your exhibition space</p>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/interviews" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-green-50 transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">📅 Interview Slots</p>
              <p className="text-xs text-gray-600">Schedule & manage interviews</p>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/interviews" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">⏰ Quick Schedule</p>
              <p className="text-xs text-gray-600">Add slots in bulk</p>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem disabled className="rounded-lg p-0 m-1 opacity-50">
          <div className="flex items-center w-full px-3 py-3 rounded-lg">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-500">💼 Post New Job</p>
              <p className="text-xs text-gray-400">Coming soon...</p>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuLabel className="text-lg font-bold text-gray-900 px-3 py-2">
          👀 View & Track
        </DropdownMenuLabel>
        
        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/candidates" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-orange-50 transition-colors">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">👥 Browse Candidates</p>
              <p className="text-xs text-gray-600">Discover talent pool</p>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/shortlists" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-yellow-50 transition-colors">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">⭐ Shortlisted</p>
              <p className="text-xs text-gray-600">Your favorite candidates</p>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/analytics" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <BarChart className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">📊 Analytics</p>
              <p className="text-xs text-gray-600">Performance insights</p>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-lg p-0 m-1">
          <Link href="/employer/settings" className="cursor-pointer flex items-center w-full px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">⚙️ Settings</p>
              <p className="text-xs text-gray-600">Account preferences</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 