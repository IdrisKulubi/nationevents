import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare, BookOpen } from "lucide-react";
import type { DashboardData } from "@/lib/services/nxt-her-dashboard";

interface DashboardStatsProps {
  stats: DashboardData["stats"];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      icon: Calendar,
      value: stats.totalSessions,
      label: "Sessions Available",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      value: `${stats.totalAttendees}+`,
      label: "Attendees",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: MessageSquare,
      value: stats.totalForums,
      label: "Discussion Forums",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BookOpen,
      value: stats.totalSpeakers,
      label: "Speakers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-600 leading-tight">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}