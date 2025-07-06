"use client";

import { Button } from "@/components/ui/button";
import { initiateEmployerSignIn } from "@/lib/actions/auth-actions";
import { useTransition } from "react";
import { FaGoogle } from "react-icons/fa";

export function CompanyGoogleLogin() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      initiateEmployerSignIn();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <span className="animate-pulse">Signing in...</span>
        ) : (
          <>
            <FaGoogle className="mr-2 h-4 w-4" />
            Continue as Company
          </>
        )}
      </Button>
    </form>
  );
} 