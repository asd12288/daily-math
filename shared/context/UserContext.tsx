"use client";

// shared/context/UserContext.tsx
// Provides user profile data across the dashboard

import React, { createContext, useContext, type ReactNode } from "react";
import { trpc } from "@/trpc/client";
import type { UserProfile, UserRole } from "@/lib/appwrite/types";
import { XP_LEVELS } from "@/lib/appwrite/types";

interface UserContextType {
  profile: UserProfile | null | undefined;
  isLoading: boolean;
  error: Error | null;
  // Computed values
  displayName: string;
  initials: string;
  levelTitle: string;
  xpToNextLevel: number;
  xpProgress: number; // 0-100 percentage
  // Role-based access
  role: UserRole;
  isAdmin: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = trpc.dashboard.getUserProfile.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Compute derived values
  const displayName = profile?.displayName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Get level info
  const currentLevel = profile?.currentLevel || 1;
  const totalXp = profile?.totalXp || 0;

  const currentLevelInfo = XP_LEVELS.find((l) => l.level === currentLevel) || XP_LEVELS[0];
  const nextLevelInfo = XP_LEVELS.find((l) => l.level === currentLevel + 1);

  const levelTitle = currentLevelInfo.title;
  const xpForCurrentLevel = currentLevelInfo.xpRequired;
  const xpForNextLevel = nextLevelInfo?.xpRequired || currentLevelInfo.xpRequired;
  const xpToNextLevel = xpForNextLevel - totalXp;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeededForLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100) : 100;

  // Role-based access
  const role: UserRole = profile?.role || "user";
  const isAdmin = role === "admin";

  const value: UserContextType = {
    profile,
    isLoading,
    error: error as Error | null,
    displayName,
    initials,
    levelTitle,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    xpProgress,
    role,
    isAdmin,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
