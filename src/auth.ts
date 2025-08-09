import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { nxtHerAttendees, nxtHerEvents } from "@/db/nxt-her-schema";
import { nanoid } from "nanoid";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "nxt_her_attendee";
      profileCompleted: boolean;
      eventType: "nxt_her_summit";
    } & DefaultSession["user"];
  }
  interface User {
    role: "nxt_her_attendee";
    profileCompleted: boolean;
    eventType: "nxt_her_summit";
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      // Always redirect to Nxt Her dashboard
      return `${baseUrl}/nxt-her/dashboard`;
    },
    async jwt({ token, user, trigger, account, session }) {
      // If the session was updated with new data (e.g., from a form), merge it into the token
      if (trigger === "update" && session?.profileCompleted) {
        token.profileCompleted = session.profileCompleted;
      }

      // On initial sign-in, add user data to the token
      if (user && account) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;

        // Create or find Nxt Her attendee record
        let attendee = await db.query.nxtHerAttendees.findFirst({
          where: eq(nxtHerAttendees.email, user.email!),
        });

        if (!attendee) {
          // Get or create the Nxt Her Summit event
          let event = await db.query.nxtHerEvents.findFirst({
            where: eq(nxtHerEvents.name, "Nxt Her Summit"),
          });

          if (!event) {
            const eventId = nanoid();
            await db.insert(nxtHerEvents).values({
              id: eventId,
              name: "Nxt Her Summit",
              description:
                "An empowering experience of connection, learning, and growth",
              startDate: new Date("2024-06-01"),
              endDate: new Date("2024-06-03"),
              venue: "TBD",
              isActive: true,
            });

            // Refetch the created event
            event = await db.query.nxtHerEvents.findFirst({
              where: eq(nxtHerEvents.id, eventId),
            });
          }

          if (event) {
            // Create attendee record with Google profile data
            const [firstName, ...lastNameParts] = (user.name || "").split(" ");
            const lastName = lastNameParts.join(" ") || "";

            const attendeeId = nanoid();
            await db.insert(nxtHerAttendees).values({
              id: attendeeId,
              eventId: event.id,
              firstName: firstName || "Unknown",
              lastName: lastName || "User",
              email: user.email!,
              phoneNumber: "", // Will be filled during profile completion
              profilePhotoUrl: user.image,
              country: "", // Will be filled during profile completion
              city: "", // Will be filled during profile completion
              attendanceType: "virtual", // Default, can be changed
              registrationStatus: "approved",
              registrationCompletedAt: new Date(),
              termsAccepted: true, // Assumed true for Google OAuth users
              infoSharingConsent: false, // Default, can be changed
              termsAcceptedAt: new Date(),
            });

            // Refetch the created attendee
            attendee = await db.query.nxtHerAttendees.findFirst({
              where: eq(nxtHerAttendees.id, attendeeId),
            });
          }
        }

        token.role = "nxt_her_attendee";
        token.eventType = "nxt_her_summit";
        token.profileCompleted = false; // Will be updated after profile completion
      }

      // When the session is explicitly updated (e.g., after profile creation),
      // we need to refetch the user data and update the token.
      if (trigger === "update" || !token.role) {
        const attendee = await db.query.nxtHerAttendees.findFirst({
          where: eq(nxtHerAttendees.email, token.email as string),
        });

        if (attendee) {
          token.name = `${attendee.firstName} ${attendee.lastName}`;
          token.email = attendee.email;
          token.image = attendee.profilePhotoUrl;
          token.role = "nxt_her_attendee";
          token.eventType = "nxt_her_summit";
          // Profile is complete if they have filled required fields
          token.profileCompleted = !!(
            attendee.phoneNumber &&
            attendee.country &&
            attendee.city
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = "nxt_her_attendee";
        session.user.profileCompleted = token.profileCompleted as boolean;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null;
        session.user.eventType = "nxt_her_summit";
      }
      return session;
    },
  },
});
