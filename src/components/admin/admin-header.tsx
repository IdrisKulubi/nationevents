"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: any;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [notifications] = useState([
    {
      id: 1,
      title: "New security incident reported",
      message: "Unauthorized access attempt at Checkpoint 1",
      type: "alert",
      time: "2 min ago",
    },
    {
      id: 2,
      title: "System backup completed",
      message: "Daily backup process finished successfully",
      type: "success",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "High user registration volume",
      message: "150+ new registrations in the last hour",
      type: "info",
      time: "2 hours ago",
    },
  ]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Title and breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Huawei Career Summit Management
            </p>
          </div>
        </div>

        {/* Right side - System status, notifications, and user menu */}
        <div className="flex items-center gap-4">
          {/* System Status Indicators */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                System Online
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-600">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex-col items-start p-3">
                  <div className="flex w-full items-start gap-3">
                    <div className="mt-1">
                      {notification.type === "alert" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {notification.type === "success" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {notification.type === "info" && (
                        <Activity className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    {getInitials(user.name || "Admin")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 text-xs">
                    Administrator
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 