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
      // Handle company onboard flow - preserve search params
      if (url.includes('from=company-onboard') || url.includes('role=employer')) {
        if (url.includes('/employer/setup')) {
          return url.startsWith('/') ? `${baseUrl}${url}` : url;
        }
        // If not already going to employer setup, redirect there with company onboard params
        return `${baseUrl}/employer/setup?from=company-onboard`;
      }
      
      // Allow direct access to employer setup (for company onboard flow)
      if (url.includes('/employer/setup')) {
        return url.startsWith('/') ? `${baseUrl}${url}` : url;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, account, user, trigger }) {
      if (account) {
        token.provider = account.provider;
      }
      
      // Mark new users (when account exists, it's usually a sign in)
      if (account && user) {
        token.isNewUser = true;
      }

      // On sign-in or when token is new, fetch role from DB and add to token
      if (user) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id!),
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Failed to fetch user role for token:", error);
          token.role = "job_seeker"; // Default role on error
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.isNewUser = !!token.isNewUser;
        session.user.role = token.role as string | undefined; // Get role from token
        
        try {
          // Get user profile including job seeker data
          const userWithProfile = await db
            .select({
              user: users,
              jobSeeker: jobSeekers,
            })
            .from(users)
            .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
            .where(eq(users.id, token.sub))
            .limit(1);
          
          const profile = userWithProfile[0];
          
          if (profile) {
            session.user.hasProfile = true;
            // The role from the DB is the source of truth, but token is a good fallback
            session.user.role = profile.user.role || token.role as string | undefined;
            session.user.profileCompleted = !!profile.jobSeeker?.id;
          } else {
            session.user.hasProfile = false;
            session.user.profileCompleted = false;
          }
        } catch (error) {
          console.error("Database connection error in auth session:", error);
          
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
          const errorName = error instanceof Error ? error.name : 'Unknown';
          
          console.error("Error details:", {
            message: errorMessage,
            code: errorCode,
            name: errorName
          });
          
          // Set default values when database is unreachable
          session.user.hasProfile = false;
          session.user.profileCompleted = false;
          // The role from the token is already set, so we don't lose it here
          
          // Log additional context for debugging
          if (errorMessage.includes('timeout')) {
            console.error("Database timeout - check AWS RDS connectivity and security groups");
          }
          if (errorMessage.includes('authentication')) {
            console.error("Database authentication failed - check credentials in POSTGRES_URL");
          }
        }
      }
      return session;
    },
  },
});