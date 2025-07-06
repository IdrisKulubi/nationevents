import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { users, jobSeekers, employers } from "../db/schema";
import { cookies } from "next/headers";

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
      
      // For all other cases, let middleware handle the routing
      console.log("[AUTH_FLOW] Defaulting to root, middleware will handle routing.");
      return `${baseUrl}/`;
    },
    async jwt({ token, user, trigger, account }) {
      // On initial sign-in, check for and handle employer intent
      if (user && account) { // This block only runs on sign-in
        token.sub = user.id;
        const cookieStore = await cookies();
        const intentCookie = cookieStore.get("auth_intent");

        if (intentCookie?.value === "employer") {
          console.log("JWT: Employer intent detected. Updating role.", { userId: user.id });
          try {
            await db.update(users).set({ role: "employer" }).where(eq(users.id, user.id!));
            // Clean up the cookie immediately after use
            cookieStore.delete("auth_intent");
          } catch (error) {
            console.error("JWT: Failed to update user role to employer.", error);
          }
        }
      }

      // This logic runs on sign-in AND on session updates.
      // We need to ensure we have the most up-to-date user info in the token.
      const shouldRefresh = user || trigger === "update";

      if (shouldRefresh) {
        console.log("JWT: Refreshing token data from DB.", { userId: token.sub, trigger });
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.sub!),
          });

          if (dbUser) {
            token.role = dbUser.role;

            // Check profile completion based on role
            if (dbUser.role === 'employer') {
              const employerProfile = await db.query.employers.findFirst({
                where: eq(employers.userId, dbUser.id),
              });
              // An employer profile is complete if it exists and has a company name.
              token.profileCompleted = !!(employerProfile?.id && employerProfile?.companyName);
            } else { // 'job_seeker' or other default roles
              const jobSeekerProfile = await db.query.jobSeekers.findFirst({
                where: eq(jobSeekers.userId, dbUser.id),
              });
              // A job seeker profile is complete if it exists and has a CV.
              token.profileCompleted = !!(jobSeekerProfile?.id && jobSeekerProfile?.cvUrl);
            }
             console.log("JWT: Token data refreshed.", { role: token.role, profileCompleted: token.profileCompleted });
          } else {
            console.warn("JWT: User not found during refresh.", { userId: token.sub });
          }
        } catch (error) {
          console.error("JWT: Error refreshing token data.", error);
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