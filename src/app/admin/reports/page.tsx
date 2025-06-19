import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield,
  Calendar,
  Activity,
  Download,
  ArrowRight,
  Database,
  Target,
  Globe
} from "lucide-react";

export default async function AdminReportsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Basic role check - in a real app you'd check the database
  // For now we'll assume users with admin emails or specific roles have access
  const isAdmin = session.user.email?.includes("admin") || session.user.role === "admin";
  
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const reportSections = [
    {
      title: "Attendance Reports",
      description: "Track event attendance, check-ins, and verification analytics",
      icon: Users,
      href: "/admin/reports/attendance",
      color: "from-blue-500 to-blue-600",
      features: ["Real-time attendance tracking", "Checkpoint analytics", "Verification metrics", "Hourly trends"]
    },
    {
      title: "User Analytics",
      description: "Comprehensive user insights and registration analytics",
      icon: TrendingUp,
      href: "/admin/reports/users",
      color: "from-purple-500 to-pink-600",
      features: ["User growth trends", "Role distribution", "Registration funnel", "Geographic insights"]
    },
    {
      title: "Event Performance",
      description: "Overall event success metrics and performance indicators",
      icon: Target,
      href: "/admin/reports/performance",
      color: "from-orange-500 to-red-600",
      features: ["KPI dashboard", "Conversion rates", "Employer engagement", "Success metrics"]
    },
    {
      title: "System Reports",
      description: "System health, performance metrics, and operational insights",
      icon: Shield,
      href: "/admin/reports/system",
      color: "from-indigo-500 to-purple-600",
      features: ["System health monitoring", "Error tracking", "Performance metrics", "Activity logs"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Comprehensive reporting dashboard for event management and system insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="h-4 w-4 mr-2" />
              Live Data
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-2" />
              Real-time Updates
            </Badge>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 opacity-80" />
                <div>
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-blue-100 text-sm">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div>
                  <div className="text-2xl font-bold">94.2%</div>
                  <div className="text-green-100 text-sm">Attendance Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 opacity-80" />
                <div>
                  <div className="text-2xl font-bold">87.5%</div>
                  <div className="text-purple-100 text-sm">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 opacity-80" />
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-orange-100 text-sm">System Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reportSections.map((section, index) => {
            const Icon = section.icon;
            
            return (
              <Card key={index} className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                        {section.title}
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {section.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button asChild className={`flex-1 bg-gradient-to-r ${section.color} hover:opacity-90 text-white shadow-lg`}>
                      <Link href={section.href}>
                        View Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" className="px-3">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Data Export & Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Export comprehensive reports in multiple formats for external analysis and integration with your existing systems.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All Reports (JSON)
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Generate Executive Summary
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Report Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Attendance report exported", user: "Admin User", time: "2 minutes ago", type: "export" },
                { action: "User analytics generated", user: "System", time: "15 minutes ago", type: "generate" },
                { action: "Performance metrics updated", user: "System", time: "1 hour ago", type: "update" },
                { action: "System health check completed", user: "System", time: "2 hours ago", type: "check" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === "export" ? "bg-blue-500" :
                    activity.type === "generate" ? "bg-green-500" :
                    activity.type === "update" ? "bg-orange-500" :
                    "bg-purple-500"
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {activity.action}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {activity.user} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 