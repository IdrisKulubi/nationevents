"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Globe, Award, Coffee, BookOpen, MessageCircle, ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1">
        {/* Main Form Area - Vertically Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center sm:text-left mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back 
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Powering the Feminist Future
                through Media
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm mb-3">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm mb-3">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-[#0875b6] hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0875b6] text-white hover:bg-blue-700 py-3"
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>Need help?
                      <span className="text-sm text-[#0875b6] hover:text-blue-700 font-medium ml-1">
                       Contact support
                      </span>
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#0875b6] hover:text-blue-700 font-medium">
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[700px] relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/woman2.jpg"
              alt="Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-800/70 to-blue-900/80"></div>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 right-8 w-24 h-24 bg-slate-300/20 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 right-20 w-20 h-20 bg-blue-300/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-20 w-16 h-16 bg-slate-400/20 rounded-full blur-xl"></div>
          </div>

          {/* 3D Spheres */}
          <div className="absolute top-32 left-8 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full shadow-lg"></div>
          <div className="absolute bottom-32 right-12 w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full shadow-lg"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full shadow-lg"></div>
          <div className="absolute top-40 right-12 w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full shadow-lg"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full shadow-lg"></div>

          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
            
            <p className="text-white/90 mb-8 leading-relaxed text-lg">
              Reconnect with your network and continue your journey of leadership and growth.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
} 