// modules/gamification/server/services/user-profile.service.ts
// Service for managing user profile XP, levels, and streaks

import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import {
  getUserLocalDate,
  getDateInTimezone,
  isConsecutiveDay,
  isSameDay,
  DEFAULT_TIMEZONE,
} from "@/lib/utils/timezone";

/**
 * XP thresholds for each level (1-10)
 */
export const XP_LEVELS = [
  { level: 1, title: "Beginner", titleHe: "מתחיל", xpRequired: 0 },
  { level: 2, title: "Student", titleHe: "תלמיד", xpRequired: 100 },
  { level: 3, title: "Learner", titleHe: "לומד", xpRequired: 250 },
  { level: 4, title: "Practitioner", titleHe: "מתרגל", xpRequired: 500 },
  { level: 5, title: "Scholar", titleHe: "חוקר", xpRequired: 1000 },
  { level: 6, title: "Expert", titleHe: "מומחה", xpRequired: 2000 },
  { level: 7, title: "Master", titleHe: "אמן", xpRequired: 3500 },
  { level: 8, title: "Grandmaster", titleHe: "רב אמן", xpRequired: 5500 },
  { level: 9, title: "Legend", titleHe: "אגדה", xpRequired: 8000 },
  { level: 10, title: "Sage", titleHe: "חכם", xpRequired: 10000 },
] as const;

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXp(totalXp: number): number {
  let level = 1;
  for (const levelInfo of XP_LEVELS) {
    if (totalXp >= levelInfo.xpRequired) {
      level = levelInfo.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get XP required for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= 10) return XP_LEVELS[9].xpRequired;
  return XP_LEVELS[currentLevel].xpRequired;
}

/**
 * Get level info by level number
 */
export function getLevelInfo(level: number) {
  return XP_LEVELS[Math.min(level - 1, 9)] || XP_LEVELS[0];
}

/**
 * User profile service for XP, levels, and streaks
 */
export class UserProfileService {
  /**
   * Sync XP to user profile after earning XP
   * Updates totalXp and recalculates level if needed
   */
  static async syncUserXp(userId: string, xpToAdd: number): Promise<{
    success: boolean;
    newTotalXp: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    if (xpToAdd <= 0) {
      return { success: true, newTotalXp: 0, newLevel: 1, leveledUp: false };
    }

    const { databases } = await createAdminClient();

    try {
      // Find user profile by userId
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [
          Query.equal("userId", userId),
          Query.limit(1),
        ]
      );

      if (profiles.documents.length === 0) {
        return { success: false, newTotalXp: 0, newLevel: 1, leveledUp: false };
      }

      const profile = profiles.documents[0];
      const currentXp = profile.totalXp || 0;
      const currentLevel = profile.currentLevel || 1;

      const newTotalXp = currentXp + xpToAdd;
      const newLevel = calculateLevelFromXp(newTotalXp);
      const leveledUp = newLevel > currentLevel;

      // Update profile
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        profile.$id,
        {
          totalXp: newTotalXp,
          currentLevel: newLevel,
        }
      );

      return { success: true, newTotalXp, newLevel, leveledUp };
    } catch {
      return { success: false, newTotalXp: 0, newLevel: 1, leveledUp: false };
    }
  }

  /**
   * Update streak after completing practice
   * Uses user's timezone for accurate day calculation (default: Israel time)
   */
  static async updateStreak(userId: string): Promise<{
    success: boolean;
    currentStreak: number;
    streakContinued: boolean;
  }> {
    const { databases } = await createAdminClient();

    try {
      // Find user profile by userId
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [
          Query.equal("userId", userId),
          Query.limit(1),
        ]
      );

      if (profiles.documents.length === 0) {
        return { success: false, currentStreak: 0, streakContinued: false };
      }

      const profile = profiles.documents[0];

      // Use user's timezone (default to Israel if not set)
      const userTimezone = profile.timezone || DEFAULT_TIMEZONE;
      const today = getUserLocalDate(userTimezone);

      // Get last practice date in user's timezone
      const lastPracticeDate = profile.lastPracticeDate
        ? getDateInTimezone(new Date(profile.lastPracticeDate), userTimezone)
        : null;

      // If already practiced today (in user's timezone), don't update
      if (lastPracticeDate && isSameDay(lastPracticeDate, today)) {
        return {
          success: true,
          currentStreak: profile.currentStreak || 0,
          streakContinued: true,
        };
      }

      // Calculate new streak
      let newStreak: number;
      let streakContinued: boolean;

      if (!lastPracticeDate) {
        // First time practicing
        newStreak = 1;
        streakContinued = true;
      } else if (isConsecutiveDay(lastPracticeDate, today)) {
        // Consecutive day - continue streak
        newStreak = (profile.currentStreak || 0) + 1;
        streakContinued = true;
      } else {
        // Missed a day - reset streak (hard reset)
        newStreak = 1;
        streakContinued = false;
      }

      // Check if this is a new longest streak
      const longestStreak = profile.longestStreak || 0;
      const newLongestStreak = Math.max(longestStreak, newStreak);

      // Update profile with streak and longest streak
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        profile.$id,
        {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastPracticeDate: new Date().toISOString(),
        }
      );

      return { success: true, currentStreak: newStreak, streakContinued };
    } catch {
      return { success: false, currentStreak: 0, streakContinued: false };
    }
  }

  /**
   * Get user profile stats
   */
  static async getUserStats(userId: string): Promise<{
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    levelTitle: string;
    levelTitleHe: string;
    xpToNextLevel: number;
    progressToNextLevel: number;
  } | null> {
    const { databases } = await createAdminClient();

    try {
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [
          Query.equal("userId", userId),
          Query.limit(1),
        ]
      );

      if (profiles.documents.length === 0) {
        return null;
      }

      const profile = profiles.documents[0];
      const totalXp = profile.totalXp || 0;
      const currentLevel = profile.currentLevel || 1;
      const currentStreak = profile.currentStreak || 0;
      const longestStreak = profile.longestStreak || 0;

      const levelInfo = getLevelInfo(currentLevel);
      const nextLevelXp = getXpForNextLevel(currentLevel);
      const currentLevelXp = levelInfo.xpRequired;
      const xpToNextLevel = nextLevelXp - totalXp;
      const progressToNextLevel =
        currentLevel >= 10
          ? 100
          : Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

      return {
        totalXp,
        currentLevel,
        currentStreak,
        longestStreak,
        levelTitle: levelInfo.title,
        levelTitleHe: levelInfo.titleHe,
        xpToNextLevel: Math.max(0, xpToNextLevel),
        progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
      };
    } catch {
      return null;
    }
  }
}

/**
 * XP Bonus calculation utilities
 */
export const XP_BASE = {
  questionCorrect: 10,       // Base XP for correct answer
  dailySetComplete: 25,      // Bonus for completing daily set
  streakBonus: 5,            // Per day in streak (e.g., 7-day streak = +35 XP)
  perfectDayBonus: 15,       // All exercises correct
} as const;

export const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2,
} as const;

/**
 * Calculate XP for a question based on difficulty and correctness
 */
export function calculateQuestionXp(
  difficulty: "easy" | "medium" | "hard",
  isCorrect: boolean
): number {
  if (!isCorrect) return 0;
  return Math.round(XP_BASE.questionCorrect * DIFFICULTY_MULTIPLIERS[difficulty]);
}

/**
 * Calculate streak bonus XP
 */
export function calculateStreakBonus(streakDays: number): number {
  // Streak bonus: 5 XP per day in streak, max 50 XP
  return Math.min(streakDays * XP_BASE.streakBonus, 50);
}

/**
 * Calculate total XP for completing a daily set
 */
export function calculateDailySetXp(params: {
  questionsCorrect: number;
  totalQuestions: number;
  currentStreak: number;
  difficulties: ("easy" | "medium" | "hard")[];
}): {
  baseXp: number;
  completionBonus: number;
  streakBonus: number;
  perfectBonus: number;
  totalXp: number;
} {
  const { questionsCorrect, totalQuestions, currentStreak, difficulties } = params;

  // Base XP from questions (10 per correct, multiplied by difficulty)
  let baseXp = 0;
  for (let i = 0; i < questionsCorrect && i < difficulties.length; i++) {
    baseXp += calculateQuestionXp(difficulties[i], true);
  }

  // Completion bonus for finishing daily set
  const completionBonus = XP_BASE.dailySetComplete;

  // Streak bonus
  const streakBonus = calculateStreakBonus(currentStreak);

  // Perfect day bonus (all correct)
  const perfectBonus = questionsCorrect === totalQuestions ? XP_BASE.perfectDayBonus : 0;

  const totalXp = baseXp + completionBonus + streakBonus + perfectBonus;

  return {
    baseXp,
    completionBonus,
    streakBonus,
    perfectBonus,
    totalXp,
  };
}
