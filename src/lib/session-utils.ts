"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

/**
 * Custom hook for managing session updates, particularly useful for role changes
 */
export function useSessionManager() {
  const { data: session, status, update } = useSession();

  /**
   * Force refresh the session to get latest user data from database
   */
  const refreshSession = useCallback(async () => {
    console.log("Refreshing session to sync with database");
    try {
      await update();
      return true;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return false;
    }
  }, [update]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: string) => {
    return session?.user?.role === role;
  }, [session?.user?.role]);

  /**
   * Wait for session to be loaded and optionally refresh it
   */
  const waitForSession = useCallback(async (shouldRefresh = false) => {
    if (status === "loading") {
      // Wait for session to load
      return new Promise((resolve) => {
        const checkSession = () => {
          if (status !== "loading") {
            resolve(session);
          } else {
            setTimeout(checkSession, 100);
          }
        };
        checkSession();
      });
    }

    if (shouldRefresh) {
      await refreshSession();
    }

    return session;
  }, [status, session, refreshSession]);

  return {
    session,
    status,
    refreshSession,
    hasRole,
    waitForSession,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

/**
 * Server-side utility to trigger session refresh
 */
export async function triggerSessionRefresh() {
  // This is a placeholder for server-side session refresh
  // The actual refresh happens on the client side
  console.log("Session refresh triggered from server");
} 