import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { users, jobSeekers } from "../db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      profileCompleted?: boolean;
      hasProfile: boolean;
      isNewUser?: boolean;
    } & DefaultSession["user"];
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
      console.log("[AUTH_FLOW] Redirect callback invoked.", { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log("[AUTH_FLOW] Allowing relative callback URL:", url);
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log("[AUTH_FLOW] Allowing same-origin callback URL:", url);
        return url;
      }
      
      // For all other cases, default to a safe dashboard page.
      console.log("[AUTH_FLOW] Defaulting to dashboard redirect.");
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, trigger, account }) {
      // On initial sign-in, persist the user's role and ID to the token.
      if (user) {
        token.sub = user.id; // Ensure 'sub' is set to the user's database ID
        
        console.log("JWT: Initial sign-in or user object available.", { userId: user.id, trigger });
        
        // WORKAROUND: Fetch user and profile in two steps to avoid Drizzle 'relations' issue.
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id!),
          });

          if (dbUser) {
            token.role = dbUser.role;
            const jobSeekerProfile = await db.query.jobSeekers.findFirst({
              where: eq(jobSeekers.userId, dbUser.id),
            });
            token.profileCompleted = !!(jobSeekerProfile?.id && jobSeekerProfile?.cvUrl);
            console.log("JWT: User data fetched on sign-in.", { role: token.role, profileCompleted: token.profileCompleted });
          } else {
            console.warn("JWT: User not found in database during initial sign-in.", { userId: user.id });
            token.role = 'job_seeker'; // Default role
            token.profileCompleted = false;
          }
        } catch (error) {
          console.error("JWT: Error fetching user on sign-in.", error);
          token.role = 'job_seeker';
          token.profileCompleted = false;
        }
      }

      // Handle session updates, e.g., after profile completion or role change
      if (trigger === "update") {
        console.log("JWT: 'update' trigger received. Refreshing token data from DB.", { userId: token.sub });
        // WORKAROUND: Fetch user and profile in two steps to avoid Drizzle 'relations' issue.
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.sub!),
          });

          if (dbUser) {
            token.role = dbUser.role;
            const jobSeekerProfile = await db.query.jobSeekers.findFirst({
              where: eq(jobSeekers.userId, dbUser.id),
            });
            token.profileCompleted = !!(jobSeekerProfile?.id && jobSeekerProfile?.cvUrl);
            console.log("JWT: Token data refreshed.", { role: token.role, profileCompleted: token.profileCompleted });
          } else {
             console.warn("JWT: User not found during 'update' trigger.", { userId: token.sub });
          }
        } catch (error) {
          console.error("JWT: Error refreshing token on 'update' trigger.", error);
          // Avoid overwriting existing token data if DB fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      // The session callback is for passing data from the token to the client.
      // It should not perform any database lookups.
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string | undefined;
        session.user.profileCompleted = token.profileCompleted as boolean;
        
        // Deprecating hasProfile in favor of profileCompleted for clarity, but keeping for compatibility
        session.user.hasProfile = token.profileCompleted as boolean;
      }
      return session;
    },
  },
});