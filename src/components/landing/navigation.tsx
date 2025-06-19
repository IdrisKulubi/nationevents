'use client';

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { UserAccount } from "@/components/auth/user-account";
import { Menu, X, Calendar, Users, Info, Phone } from "lucide-react";
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            {/* Combined Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Image
                  src="https://res.cloudinary.com/db0i0umxn/image/upload/v1750154851/huaweilogo_jrvcs6.jpg"
                  alt="Nation-Huawei Leap Job Fair"
                  width={160}
                  height={100}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--huawei-red)] dark:hover:text-[var(--huawei-red)] transition-colors duration-300 group"
                    >
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* User Account or CTA Button */}
            {session?.user ? (
              <UserAccount />
            ) : (
              <Button 
                asChild
                size="sm" 
                className="hidden md:flex bg-huawei-gradient hover:opacity-90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/login">
                  Register Now
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="container mx-auto px-6 py-6">
            {/* Mobile Navigation Links */}
            <ul className="space-y-4 mb-6">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--huawei-red)] transition-all duration-300 group"
                    >
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile CTA */}
            <div className="space-y-3">
              {session?.user ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <UserAccount />
                </div>
              ) : (
                <>
                  <Button 
                    asChild
                    className="w-full bg-huawei-gradient hover:opacity-90 text-white border-0 shadow-md"
                  >
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      Register Now
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
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