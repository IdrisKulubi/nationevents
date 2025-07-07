import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { users, jobSeekers, employers } from "@/db/schema";
import { cookies } from "next/headers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "job_seeker" | "employer" | "admin" | "security";
      profileCompleted: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    role: "job_seeker" | "employer" | "admin" | "security";
    profileCompleted: boolean;
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
      // Default to the dashboard, and let the middleware handle role-based redirects.
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, trigger, account }) {
      // On initial sign-in, add user data to the token
      if (user && account) {
        token.sub = user.id;
        token.role = user.role;
        token.profileCompleted = user.profileCompleted;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        
        const cookieStore = cookies();
        const intentCookie = (await cookieStore).get("auth_intent");
        if (intentCookie?.value === "employer") {
          await db.update(users).set({ role: "employer" }).where(eq(users.id, user.id!));
          token.role = "employer";
          (await cookieStore).delete("auth_intent");
        }
      }
      
      // When the session is explicitly updated (e.g., after profile creation),
      // we need to refetch the user data and update the token.
      if (trigger === "update" || !token.role) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub!),
          with: {
            jobSeeker: true,
            employer: true,
          },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
          token.role = dbUser.role;
          if (dbUser.role === 'employer') {
            token.profileCompleted = !!dbUser.employer;
          } else if (dbUser.role === 'job_seeker') {
            token.profileCompleted = !!dbUser.jobSeeker;
          } else {
            token.profileCompleted = true; // Admins/Security are always considered complete
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as "job_seeker" | "employer" | "admin" | "security";
        session.user.profileCompleted = token.profileCompleted as boolean;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
});