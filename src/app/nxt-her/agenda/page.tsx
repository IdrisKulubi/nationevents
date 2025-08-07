import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPersonalizedAgenda } from "@/lib/services/nxt-her-agenda";
import { PersonalizedAgendaClient } from "@/components/nxt-her/agenda/personalized-agenda-client";

export default async function NxtHerAgendaPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "nxt_her_attendee") {
    redirect("/nxt-her/login");
  }

  const agenda = await getPersonalizedAgenda(session.user.email!);
  
  if (!agenda) {
    redirect("/nxt-her/register");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personal Agenda
          </h1>
          <p className="text-lg text-gray-600">
            Discover sessions tailored to your interests and manage your schedule
          </p>
        </div>

        <PersonalizedAgendaClient agenda={agenda} />
      </div>
    </div>
  );
}