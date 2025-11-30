// modules/gamification/server/services/user-profile.service.ts
// Service for managing user profile XP, levels, and streaks

import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

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
        console.error(`[UserProfile] Profile not found for user ${userId}`);
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

      console.log(`[UserProfile] Updated XP for user ${userId}: +${xpToAdd} XP (total: ${newTotalXp}, level: ${newLevel})`);

      if (leveledUp) {
        console.log(`[UserProfile] User ${userId} leveled up to level ${newLevel}!`);
      }

      return { success: true, newTotalXp, newLevel, leveledUp };
    } catch (error) {
      console.error(`[UserProfile] Failed to sync XP for user ${userId}:`, error);
      return { success: false, newTotalXp: 0, newLevel: 1, leveledUp: false };
    }
  }

  /**
   * Update streak after completing practice
   * Returns updated streak count and whether it continued or reset
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
        console.error(`[UserProfile] Profile not found for user ${userId}`);
        return { success: false, currentStreak: 0, streakContinued: false };
      }

      const profile = profiles.documents[0];
      const lastPracticeDate = profile.lastPracticeDate
        ? new Date(profile.lastPracticeDate).toISOString().split("T")[0]
        : null;
      const today = new Date().toISOString().split("T")[0];

      // If already practiced today, don't update
      if (lastPracticeDate === today) {
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
      } else {
        const lastDate = new Date(lastPracticeDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day - continue streak
          newStreak = (profile.currentStreak || 0) + 1;
          streakContinued = true;
        } else {
          // Missed a day - reset streak
          newStreak = 1;
          streakContinued = false;
          console.log(`[UserProfile] Streak reset for user ${userId} (missed ${diffDays - 1} days)`);
        }
      }

      // Update profile
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        profile.$id,
        {
          currentStreak: newStreak,
          lastPracticeDate: new Date().toISOString(),
        }
      );

      console.log(`[UserProfile] Updated streak for user ${userId}: ${newStreak} days`);

      return { success: true, currentStreak: newStreak, streakContinued };
    } catch (error) {
      console.error(`[UserProfile] Failed to update streak for user ${userId}:`, error);
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
        levelTitle: levelInfo.title,
        levelTitleHe: levelInfo.titleHe,
        xpToNextLevel: Math.max(0, xpToNextLevel),
        progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
      };
    } catch (error) {
      console.error(`[UserProfile] Failed to get stats for user ${userId}:`, error);
      return null;
    }
  }
}
