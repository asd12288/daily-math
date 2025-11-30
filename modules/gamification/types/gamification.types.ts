// modules/gamification/types/gamification.types.ts
// Type definitions for the gamification module

export interface GamificationStats {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  levelTitle: string;
  levelTitleHe: string;
  xpToNextLevel: number;
  progressToNextLevel: number; // 0-100
}

export interface XpGainEvent {
  amount: number;
  source: "question" | "daily_completion" | "streak_bonus" | "perfect_day";
  message?: string;
  timestamp: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  titleHe: string;
  xpRequired: number;
  icon?: string;
}

export interface XpSyncResult {
  success: boolean;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  streakBonus?: number;
}

export interface StreakUpdateResult {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  streakContinued: boolean;
}

// Toast types for XP notifications
export type XpToastType = "earned" | "bonus" | "streak" | "levelup";

export interface XpToastData {
  type: XpToastType;
  xp: number;
  message?: string;
}
