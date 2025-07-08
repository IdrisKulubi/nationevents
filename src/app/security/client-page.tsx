"use client";

import { PinVerificationForm } from "@/components/security/pin-verification-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const GENERIC_SECURITY_ID = "on-site-verification-station";

export function SecurityDashboardClient() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-blue-600" />
          <CardTitle className="text-2xl font-bold mt-4">Attendee Verification</CardTitle>
          <CardDescription>Enter the attendee&apos;s PIN or ticket number to verify.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PinVerificationForm securityId={GENERIC_SECURITY_ID} />
        </CardContent>
      </Card>
    </div>
  );
} 