"use client";

// modules/auth/hooks/queries/use-auth-queries.ts
// Auth query hooks for fetching session data

import { trpc } from "@/trpc/client";

/**
 * Get current session - returns null if not authenticated
 * Uses the public getSession procedure
 */
export function useCurrentUser() {
  return trpc.auth.getSession.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get authenticated user - throws if not authenticated
 * Uses the protected me procedure
 */
export function useMe() {
  return trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
