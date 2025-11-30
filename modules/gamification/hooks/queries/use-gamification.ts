// modules/gamification/hooks/queries/use-gamification.ts
// Query hooks for gamification data

import { trpc } from "@/trpc/client";

/**
 * Get current user's gamification stats (XP, level, streak)
 */
export function useGamificationStats() {
  return trpc.gamification.getStats.useQuery(undefined, {
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Get all level definitions
 */
export function useLevels() {
  return trpc.gamification.getLevels.useQuery(undefined, {
    staleTime: Infinity, // Levels never change
  });
}

/**
 * Get info for a specific level
 */
export function useLevelInfo(level: number) {
  return trpc.gamification.getLevelInfo.useQuery(level, {
    staleTime: Infinity, // Level info never changes
  });
}
