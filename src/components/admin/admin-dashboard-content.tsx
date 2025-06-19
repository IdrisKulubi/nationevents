"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building,
  Calendar,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Download,
  UserCheck,
} from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import Link from "next/link";

interface AdminDashboardContentProps {
  user: any;
}

interface DashboardStats {
  totalUsers: number;
  newRegistrations: number;
  employers: number;
  activeEvents: number;
  lastUpdated: string;
}

interface RecentActivity {
  action: string;
  details: any;
  time: Date;
  user: string;
  type: string;
}

export function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newRegistrations: 0,
    employers: 0,
    activeEvents: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Derived stats for UI display (these would come from additional API calls in a real app)
  const derivedStats = {
    securityPersonnel: 5, // Mock data - would come from API
    onlineUsers: Math.floor(stats.totalUsers * 0.1), // Mock calculation
    systemHealth: 98, // Mock data - would come from health check API
    incidentsToday: 0, // Mock data - would come from security API
    checkinsToday: Math.floor(stats.newRegistrations * 2), // Mock calculation
    attendanceRate: 85, // Mock data - would come from attendance API
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const overviewCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
      description: "Registered participants",
    },
    {
      title: "New Registrations",
      value: stats.newRegistrations,
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "green",
      description: "Last 24 hours",
    },
    {
      title: "Employers",
      value: stats.employers,
      change: "+3",
      trend: "up",
      icon: Building,
      color: "purple",
      description: "Verified companies",
    },
    {
      title: "Active Events",
      value: stats.activeEvents,
      change: "Stable",
      trend: "stable",
      icon: Calendar,
      color: "orange",
      description: "Currently running",
    },
  ];

  const systemCards = [
    {
      title: "System Health",
      value: `${derivedStats.systemHealth}%`,
      status: "excellent",
      icon: Activity,
      description: "All services operational",
    },
    {
      title: "Online Users",
      value: derivedStats.onlineUsers,
      status: "good",
      icon: Eye,
      description: "Currently active",
    },
    {
      title: "Security Status",
      value: derivedStats.incidentsToday === 0 ? "Secure" : `${derivedStats.incidentsToday} Alerts`,
      status: derivedStats.incidentsToday === 0 ? "excellent" : "warning",
      icon: Shield,
      description: "24h incident count",
    },
    {
      title: "Today's Check-ins",
      value: derivedStats.checkinsToday,
      status: "good",
      icon: CheckCircle2,
      description: "Event attendance",
    },
  ];

  const getCardColor = (color: string) => {
    const colors = {
      blue: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
      green: "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800",
      purple: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800",
      orange: "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: "text-green-600 dark:text-green-400",
      good: "text-blue-600 dark:text-blue-400",
      warning: "text-orange-600 dark:text-orange-400",
      critical: "text-red-600 dark:text-red-400",
    };
    return colors[status as keyof typeof colors] || colors.good;
  };

  const formatActivityTime = (time: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(time).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your event management system today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <Card
            key={card.title}
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${getCardColor(card.color)} hover:scale-[1.02]`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <card.icon className={`w-5 h-5 ${getStatusColor("good")}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {card.value}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {card.description}
                  </p>
                  <Badge
                    variant={card.trend === "up" ? "default" : "secondary"}
                    className={`text-xs ${
                      card.trend === "up"
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {card.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemCards.map((card, index) => (
          <Card
            key={card.title}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 hover:scale-[1.02]"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <card.icon className={`w-5 h-5 ${getStatusColor(card.status)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${getStatusColor(card.status)}`}>
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Progress */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Event Attendance Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Overall Attendance</span>
                <span className="font-medium">{derivedStats.attendanceRate}%</span>
              </div>
              <Progress value={derivedStats.attendanceRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Check-ins Today</span>
                <span className="font-medium">{derivedStats.checkinsToday}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Registration Target</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "warning" ? "bg-orange-500" :
                      "bg-blue-500"
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.details ? JSON.stringify(activity.details).slice(0, 50) + '...' : 'System activity'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {activity.user} • {formatActivityTime(activity.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/users">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Manage Users</span>
              </Link>
            </Button>
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/booths">
                <Building className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Booth Management</span>
              </Link>
            </Button>
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/booth-assignments">
                <UserCheck className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Booth Assignments</span>
              </Link>
            </Button>
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/reports">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">View Reports</span>
              </Link>
            </Button>
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/events">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Event Settings</span>
              </Link>
            </Button>
            <Button 
              asChild
              className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <Link href="/admin/crowd-control">
                <Activity className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Crowd Control</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 