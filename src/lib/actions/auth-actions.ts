"use server";

import { signIn } from "@/auth";
import { cookies } from "next/headers";

export async function initiateEmployerSignIn() {
  const cookieStore = await cookies();
  cookieStore.set("auth_intent", "employer", {
    path: "/",
    maxAge: 60 * 5, // 5 minutes lifetime
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  
  // Redirect to the Google sign-in page with the correct redirect URL
  await signIn("google", { redirectTo: "/employer/setup" });
} 