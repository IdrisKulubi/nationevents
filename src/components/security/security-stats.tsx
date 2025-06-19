import { Shield, Users, AlertTriangle, CheckCircle, Badge as BadgeIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SecurityStatsProps {
  totalVerifications: number;
  incidentsReported: number;
  isOnDuty: boolean;
  badgeNumber: string | null;
}

export function SecurityStats({
  totalVerifications,
  incidentsReported,
  isOnDuty,
  badgeNumber,
}: SecurityStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* On Duty Status */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Status</CardTitle>
          <div className={`p-2 rounded-lg ${isOnDuty ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Shield className={`h-5 w-5 ${isOnDuty ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge 
            variant={isOnDuty ? "default" : "secondary"}
            className={`px-3 py-1 text-sm font-semibold ${
              isOnDuty 
                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {isOnDuty ? "🟢 On Duty" : "🔴 Off Duty"}
          </Badge>
          {badgeNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
              <BadgeIcon className="h-4 w-4" />
              <span className="font-medium">Badge: {badgeNumber}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Verifications */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Verifications Today</CardTitle>
          <div className="p-2 rounded-lg bg-blue-100">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalVerifications}</div>
          <p className="text-sm text-gray-600 font-medium">
            Attendees verified
          </p>
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
            {totalVerifications > 0 ? "Active verification" : "No verifications yet"}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Reported */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Incidents Today</CardTitle>
          <div className={`p-2 rounded-lg ${incidentsReported > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
            <AlertTriangle className={`h-5 w-5 ${incidentsReported > 0 ? 'text-red-600' : 'text-gray-500'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold mb-1 ${incidentsReported > 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {incidentsReported}
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Reports submitted
          </p>
          <div className={`mt-2 text-xs px-2 py-1 rounded-md inline-block ${
            incidentsReported > 0 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 bg-gray-50'
          }`}>
            {incidentsReported > 0 ? "Action may be required" : "All clear"}
          </div>
        </CardContent>
      </Card>

      {/* Current Time */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Current Time</CardTitle>
          <div className="p-2 rounded-lg bg-purple-100">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false
            })}
          </div>
          <p className="text-sm text-gray-600 font-medium mb-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
            Live time
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 