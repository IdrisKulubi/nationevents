import { Calendar, Users, Star, Briefcase, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployerStatsProps {
  totalBookings: number;
  todayInterviews: number;
  shortlistedCandidates: number;
  activeJobs: number;
}

export function EmployerStats({
  totalBookings,
  todayInterviews,
  shortlistedCandidates,
  activeJobs,
}: EmployerStatsProps) {
  const stats = [
    {
      title: "Today's Interviews",
      value: todayInterviews,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      description: "Scheduled for today",
      emoji: "📅"
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Users,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      description: "All-time interviews",
      emoji: "👥"
    },
    {
      title: "Shortlisted",
      value: shortlistedCandidates,
      icon: Star,
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      description: "Candidates saved",
      emoji: "⭐"
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      description: "Open positions",
      emoji: "💼"
    }
  ];

  const getInsightMessage = (stat: typeof stats[0]) => {
    if (stat.title === "Today's Interviews") {
      if (todayInterviews === 0) return "Free day ahead! 🌟";
      if (todayInterviews <= 3) return "Manageable schedule 👍";
      if (todayInterviews <= 6) return "Busy day ahead! ⚡";
      return "Packed schedule! 🔥";
    }
    if (stat.title === "Total Bookings") {
      if (totalBookings === 0) return "Getting started 🚀";
      if (totalBookings <= 10) return "Building momentum 📈";
      if (totalBookings <= 25) return "High engagement 🎯";
      return "Outstanding reach! 🏆";
    }
    if (stat.title === "Shortlisted") {
      if (shortlistedCandidates === 0) return "Start exploring 🔍";
      if (shortlistedCandidates <= 5) return "Growing pipeline 🌱";
      if (shortlistedCandidates <= 15) return "Strong candidates 💪";
      return "Excellent pipeline! 🎉";
    }
    if (stat.title === "Active Jobs") {
      if (activeJobs === 0) return "Ready to post 📝";
      if (activeJobs <= 3) return "Focused hiring 🎯";
      if (activeJobs <= 6) return "Multiple openings 📊";
      return "Scaling fast! 🚀";
    }
    return "Great progress! 👏";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`border-2 ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">{stat.emoji}</span>
                  {stat.title}
                </CardTitle>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-sm`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {stat.description}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="w-full bg-white rounded-full h-2 shadow-inner">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-500`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, 
                        stat.title === "Today's Interviews" ? (todayInterviews / 10) * 100 :
                        stat.title === "Total Bookings" ? (totalBookings / 50) * 100 :
                        stat.title === "Shortlisted" ? (shortlistedCandidates / 20) * 100 :
                        (activeJobs / 10) * 100
                      ))}%` 
                    }}
                  />
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full bg-white shadow-sm border ${stat.borderColor} ${stat.iconColor}`}>
                  {getInsightMessage(stat)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 