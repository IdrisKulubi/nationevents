'use client';

import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Globe,
  Calendar,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { name: "Event Registration", href: "/login" },
  { name: "Employer Portal", href: "/employer" },
  { name: "Schedule", href: "/" },
  { name: "Contact", href: "/" }
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#", color: "hover:text-blue-600" },
  { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-blue-400" },
  { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:text-blue-700" },
  { name: "Instagram", icon: Instagram, href: "@/huaweievent", color: "hover:text-pink-600" }
];

export function FooterSection() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <div className="text-lg font-bold text-white">
                Nation-Huawei Leap Job Fair
              </div>
              
              {/* Huawei Logo */}
              <div className="flex items-center gap-4">
                <Image
                  src="/huawei-logo.png"
                  alt="Huawei"
                  width={100}
                  height={40}
                  className="object-contain"
                />
              </div>
              
              {/* Partnership */}
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>In partnership with</span>
              </div>
              
              {/* Nation Media Logo */}
              <div className="flex items-center gap-4">
                <Image
                  src="/nationlogo.png"
                  alt="Nation Media Group"
                  width={250}
                  height={70}
                  className="object-contain"
                />
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              A bold partnership catalyzing Kenya&apos;s job sector. Bridging talent with businesses 
              that need it, inspiring a generation of professionals to reach their utmost potential.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-slate-700 ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--huawei-red)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-white">University of Nairobi Grounds</p>
                  <p>UON Campus, Nairobi, Kenya</p>
                </div>
              </div>
              
            
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--huawei-red)] flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p>info@nation-huawei-leap.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[var(--nation-blue)] flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p>@/huaweievent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Event Details</h3>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[var(--huawei-red)]" />
                  <span className="font-medium text-white">Event Dates</span>
                </div>
                <p className="text-sm text-slate-300">June 26-27, 2025</p>
                <p className="text-sm text-slate-300">Two days of opportunities</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-[var(--nation-blue)]" />
                  <span className="font-medium text-white">Event Hours</span>
                </div>
                <p className="text-sm text-slate-300">9:00 AM - 4:00 PM</p>
                <p className="text-sm text-slate-300">Both days</p>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h4 className="font-medium text-white mb-3">Stay Updated</h4>
              <p className="text-sm text-slate-300 mb-4">
                Get the latest updates about the Nation-Huawei Leap Job Fair
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[var(--huawei-red)] transition-colors"
                />
                <Button 
                  size="sm" 
                  className="bg-huawei-gradient hover:opacity-90 text-white border-0 shadow-md transition-all duration-300"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              <p>&copy; 2025 Nation-Huawei Leap Job Fair. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 