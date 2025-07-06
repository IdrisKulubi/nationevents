import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users, employers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DebugAuthPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div>No session found</div>;
  }

  // Get user info
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Session Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Database Record:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user[0] || null, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Employer Profile:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(employerProfile[0] || null, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Redirect Logic Analysis:</h2>
          <ul className="text-sm space-y-1">
            <li>• Session exists: {session ? "✅" : "❌"}</li>
            <li>• User role: {user[0]?.role || "unknown"}</li>
            <li>• Has employer profile: {employerProfile[0] ? "✅" : "❌"}</li>
            <li>• Should redirect to employer: {user[0]?.role === "employer" ? "✅" : "❌"}</li>
            <li>• Should redirect to setup: {user[0]?.role === "employer" && !employerProfile[0] ? "✅" : "❌"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 