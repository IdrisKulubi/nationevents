'use client';

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { UserAccount } from "@/components/auth/user-account";
import { Menu, X, Calendar, Users, Info, Phone, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const navigationLinks = [
  { name: "About", href: "#about", icon: Info },
  { name: "Schedule", href: "#schedule", icon: Calendar },
  { name: "Conference", href: "#conference", icon: Users },
  { name: "Contact", href: "#contact", icon: Phone }
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-900/10' 
        : 'bg-gradient-to-b from-black/20 via-black/10 to-transparent backdrop-blur-sm'
    }`}>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110"></div>
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/newlogo.png"
                  alt="Nation-Huawei Leap Job Fair"
                  width={180}
                  height={90}
                  className="object-contain transition-all duration-300"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 ">
              <ul className="flex items-center gap-1">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all duration-300 group relative rounded-xl hover:bg-white/10"
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        
                        <Icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-300 relative z-10 text-gray-900 dark:text-white" />
                        <span className="relative z-10 text-gray-900 dark:text-white">{link.name}</span>
                        
                        {/* Active indicator */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300 rounded-full"></div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* User Account or CTA Button */}
            {session?.user ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
                <UserAccount />
              </div>
            ) : (
              <Button 
                asChild
                size="sm" 
                className="hidden md:flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <Link href="/login" className="flex items-center gap-2">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <Sparkles className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Register Now</span>
                </Link>
              </Button>
            )}

            {/* Theme Toggle with enhanced styling */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
              <ModeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 relative group"
              aria-label="Toggle menu"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              
              <div className="relative z-10 transition-transform duration-300">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/50 shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/50 to-pink-900/20 pointer-events-none"></div>
          
          <div className="container mx-auto px-6 py-6 relative">
            {/* Mobile Navigation Links */}
            <ul className="space-y-2 mb-6">
              {navigationLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={link.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 group relative border border-transparent hover:border-white/10"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-300 relative z-10" />
                      <span className="font-medium relative z-10">{link.name}</span>
                      
                      {/* Arrow indicator */}
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Enhanced Mobile CTA */}
            <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              {session?.user ? (
                <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                  <UserAccount />
                </div>
              ) : (
                <>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Register Now</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full border-2 border-purple-400/50 text-purple-300 hover:bg-purple-400/10 hover:border-purple-400 hover:text-white transition-all duration-300 transform hover:scale-[1.02] bg-white/5 backdrop-blur-xl"
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 