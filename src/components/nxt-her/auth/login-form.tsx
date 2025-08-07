"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      // Set the Nxt Her intent cookie before signing in
      document.cookie = "nxt_her_intent=true; path=/; max-age=3600" // 1 hour expiry
      
      await signIn("google", { 
        callbackUrl: "/nxt-her/dashboard",
        redirect: true 
      })
      
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Nxt Her Summit</CardTitle>
            <CardDescription>
              Sign in with your Google account to access the summit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have a Google account?{" "}
                <a 
                  href="https://accounts.google.com/signup" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Create one here
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link 
                  href="/" 
                  className="text-primary hover:underline"
                >
                  Back to Home
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}