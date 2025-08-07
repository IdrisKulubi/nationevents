import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInteractiveSchedule } from "@/lib/services/nxt-her-schedule";
import { InteractiveScheduleClient } from "@/components/nxt-her/schedule/interactive-schedule-client";

export default async function NxtHerSchedulePage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "nxt_her_attendee") {
    redirect("/nxt-her/login");
  }

  const scheduleData = await getInteractiveSchedule(session.user.email!);
  
  if (!scheduleData) {
    redirect("/nxt-her/register");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Schedule
          </h1>
          <p className="text-lg text-gray-600">
            Browse all sessions with advanced filtering and search capabilities
          </p>
        </div>

        <InteractiveScheduleClient initialData={scheduleData} />
      </div>
    </div>
  );
}