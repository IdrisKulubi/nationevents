"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export function LoginCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-huawei-gradient rounded-full blur-xl animate-bounce-gentle opacity-20"></div>
      <div className="absolute bottom-16 right-16 w-32 h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-2xl animate-bounce-gentle opacity-15" style={{ animationDelay: '1s' }}></div>
      
      {/* Main content */}
      <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
        <div className="space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            {/* Logos */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/huawei-logo.png"
                alt="Huawei"
                width={100}
                height={40}
                className="object-contain"
              />
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
              <Image
                src="/nationlogo.png"
                alt="Nation Media Group"
                width={80}
                height={32}
                className="object-contain"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                  Nation-Huawei Leap Job Fair
                </span>
                <br />
                <span className="text-red-500 bg-clip-text ">
                  Access Portal
                </span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sign in to access the Nation-Huawei Leap Job Fair 2025
              </p>
            </div>
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <Calendar className="w-4 h-4 text-[var(--huawei-red)] mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">Jun 26-27</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">2025</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">UON Graduation Square</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Nairobi</p>
            </div>
          </div>

        

          {/* Sign in form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn("google", { callbackUrl: "/" });
            }}
            className="space-y-4"
          >
            <Button className="w-full bg-huawei-gradient hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base font-medium">
              <svg
                className="mr-3 h-5 w-5"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Use your professional email to access the platform
            </p>
          </form>

          {/* Stats */}
          <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-red-500 bg-clip-text">50+</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Companies</p>
              </div>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">200+</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Positions</p>
              </div>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">1000+</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Attendees</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>By continuing, you agree to our</p>
            <div className="flex justify-center gap-4">
              <span className="text-[var(--huawei-red)] hover:underline cursor-pointer">
                Terms of Service
              </span>
              <span className="text-blue-600 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/20 dark:to-slate-600/10 rounded-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
