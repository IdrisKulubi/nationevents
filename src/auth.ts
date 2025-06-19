import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";
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
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
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
    async jwt({ token, account, user, trigger }) {
      if (account) {
        token.provider = account.provider;
      }
      
      // Mark new users (when account exists, it's usually a sign in)
      if (account && user) {
        token.isNewUser = true;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.isNewUser = !!token.isNewUser;
        
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
            session.user.role = profile.user.role || undefined;
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