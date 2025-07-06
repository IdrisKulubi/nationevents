"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import Link from "next/link";

export function LoginCard() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Job Seeker Login
        </CardTitle>
        <CardDescription>
          Sign in with your Google account to access the job fair portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleSignIn}
          className="w-full"
          variant="outline"
        >
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Are you an employer looking to register your company?
          </p>
          <Link href="/company-onboard">
            <Button variant="outline" className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              Company Registration
            </Button>
          </Link>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our Terms of Service.
        </p>
      </CardContent>
    </Card>
  );
}
