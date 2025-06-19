"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CreateEventModal } from "@/components/admin/create-event-modal";
import {
  Calendar,
  Settings,
  Users,
  Shield,
  BarChart3,
  Monitor,
  UserCog,
  Key,
  Building,
  Clock,
  AlertTriangle,
  FileText,
  Menu,
  Home,
  ChevronDown,
  Activity,
  Database,
  Bell,
  TrendingUp,
  Zap,
  Plus,
  UserCheck,
  GraduationCap
} from "lucide-react";

interface NavigationSubItem {
  title: string;
  href: string;
  icon: any;
  isModal?: boolean;
  modalType?: string;
}

interface NavigationItem {
  title: string;
  href?: string;
  icon: any;
  items?: NavigationSubItem[];
}

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home },
  {
    title: "Event Management",
    icon: Calendar,
    items: [
      { title: "All Events", href: "/admin/events", icon: Calendar },
      { 
        title: "Create Event", 
        href: "/admin/events/create", 
        icon: Plus,
        isModal: true,
        modalType: "createEvent"
      },
      // { title: "Active Event", href: "/admin/events/active", icon: Power },
      // { title: "Event Analytics", href: "/admin/events/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Event Operations",
    icon: Settings,
    items: [
      { title: "Checkpoints", href: "/admin/events/checkpoints", icon: Shield },
      { title: "Time Batches", href: "/admin/events/time-batches", icon: Clock },
      { title: "Crowd Control", href: "/admin/crowd-control", icon: Zap },
      { title: "Booths Management", href: "/admin/booths", icon: Building },
      { title: "Booth Assignments", href: "/admin/booth-assignments", icon: UserCheck },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "All Users", href: "/admin/users", icon: Users },
      { title: "Employers", href: "/admin/users/employers", icon: Building },
      { title: "Job Seekers", href: "/admin/users/jobseekers", icon: UserCheck },
      { title: "Role Management", href: "/admin/users/roles", icon: UserCog },
    ],
  },
  {
    title: "Huawei Students & Conference",
    icon: GraduationCap,
    items: [
      { title: "Huawei Students", href: "/admin/huawei-students", icon: GraduationCap },
      { title: "Conference Management", href: "/admin/conference", icon: Calendar },
      { title: "Certification Tracking", href: "/admin/certifications", icon: Shield },
    ],
  },
  // {
  //   title: "Security & Access",
  //   icon: Shield,
  //   items: [
  //     { title: "Security Personnel", href: "/admin/security/personnel", icon: Shield },
  //     { title: "PIN System", href: "/admin/security/pins", icon: Key },
  //     { title: "Access Control", href: "/admin/security/access", icon: UserCog },
  //     { title: "Security Incidents", href: "/admin/security/incidents", icon: AlertTriangle },
  //   ],
  // },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    items: [
      { title: "Impact Reports", href: "/admin/reports", icon: TrendingUp },
      { title: "Attendance Reports", href: "/admin/reports/attendance", icon: Activity },
      { title: "User Analytics", href: "/admin/reports/users", icon: Users },
      { title: "Event Performance", href: "/admin/reports/events", icon: Calendar },
      { title: "System Reports", href: "/admin/reports/system", icon: FileText },
    ],
  },
 
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-700 px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Admin Portal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigationItems.map((item) => (
          <div key={item.title}>
            {item.href ? (
              // Single link item
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                  pathname === item.href
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ) : (
              // Expandable section
              <div>
                <button
                  onClick={() => toggleSection(item.title)}
                  className="flex w-full items-center justify-between space-x-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedSections.includes(item.title) ? "rotate-180" : ""
                    )}
                  />
                </button>
                
                {expandedSections.includes(item.title) && item.items && (
                  <div className="mt-1 space-y-1 pl-6">
                    {item.items.map((subItem: NavigationSubItem) => (
                      <div key={subItem.href}>
                        {(subItem as any).isModal && (subItem as any).modalType === "createEvent" ? (
                          <CreateEventModal
                            trigger={
                              <button
                                className={cn(
                                  "flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-left",
                                  "text-slate-600 dark:text-slate-400"
                                )}
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </button>
                            }
                            defaultType="job_fair"
                          />
                        ) : (
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                              pathname === subItem.href
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                                : "text-slate-600 dark:text-slate-400"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.title}</span>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Huawei Job Fair Quick Actions  */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            Nation-Huawei Job Fair 2025
          </h3>
          <div className="space-y-2">
            <Link
              href="/admin/setup-huawei"
              className="flex items-center space-x-2 text-xs text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              <Settings className="h-3 w-3" />
              <span>Quick Setup</span>
            </Link>
            <Link
              href="/admin/booth-assignments"
              className="flex items-center space-x-2 text-xs text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              <UserCheck className="h-3 w-3" />
              <span>Booth Assignments</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center space-x-2 text-xs text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              <TrendingUp className="h-3 w-3" />
              <span>Impact Reports</span>
            </Link>
            <Link
              href="/admin/crowd-control"
              className="flex items-center space-x-2 text-xs text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              <Zap className="h-3 w-3" />
              <span>Crowd Control</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="bg-white dark:bg-slate-900 h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 