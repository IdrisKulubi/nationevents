"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = "outline", 
  size = "default", 
  className,
  children 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      await signOut({
        callbackUrl: "/nxt-her/login",
        redirect: true,
      })
      
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        "Signing out..."
      ) : (
        <>
          {children || (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </>
          )}
        </>
      )}
    </Button>
  )
}