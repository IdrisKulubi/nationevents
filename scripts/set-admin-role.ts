import { cwd } from 'node:process'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(cwd())

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { users } from "@/db/schema";

const emailToUpdate = "kulubiidris@gmail.com";
const newRole = "admin";

async function main() {
  console.log("Connecting to the database...");
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not set.");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log(`Searching for user with email: ${emailToUpdate}`);

  try {
    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, emailToUpdate))
      .limit(1);

    if (!user || user.length === 0) {
      console.error(`Error: User with email "${emailToUpdate}" not found.`);
      return;
    }

    if (user[0].role === newRole) {
      console.log(`User ${user[0].email} already has the role "${newRole}". No action needed.`);
      return;
    }

    console.log(`Found user: ${user[0].email}. Current role: ${user[0].role}. Updating role to "${newRole}"...`);

    const result = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.email, emailToUpdate))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
      });

    if (result.length > 0) {
      console.log("✅ Successfully updated user role:");
      console.log(result[0]);
    } else {
      console.error("❌ Failed to update user role. The user was found but the update operation failed.");
    }
  } catch (error) {
    console.error("An error occurred during the database operation:", error);
  } finally {
    console.log("Closing database connection.");
    await client.end();
  }
}

main().catch(console.error); 