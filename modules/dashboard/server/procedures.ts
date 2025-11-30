// modules/dashboard/server/procedures.ts
// Dashboard tRPC procedures for fetching user profile and stats

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import type { UserProfile } from "@/lib/appwrite/types";

export const dashboardRouter = createTRPCRouter({
  /**
   * Get full user profile with gamification stats
   * Creates profile if it doesn't exist (for existing users who registered before profile creation was added)
   */
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const { databases } = await createAdminClient();
    const { userId, email, name } = ctx.session;

    try {
      // Try to get existing profile
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", userId)]
      );

      if (profiles.documents.length > 0) {
        return profiles.documents[0] as unknown as UserProfile;
      }

      // Profile doesn't exist - create one for this existing user
      // Note: Appwrite automatically tracks $createdAt and $updatedAt
      const newProfile = await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        userId, // Use userId as document ID
        {
          userId,
          email,
          displayName: name || email.split("@")[0],
          totalXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          dailyExerciseCount: 5,
          enrolledCourses: "[]",
          preferredTime: "09:00",
          emailReminders: true,
          streakWarnings: true,
          weeklyReport: false,
        }
      );

      return newProfile as unknown as UserProfile;
    } catch (error) {
      console.error("Error fetching/creating user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }),

  /**
   * Get dashboard stats (for quick stats display)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { databases } = await createAdminClient();
    const { userId } = ctx.session;

    try {
      // Get user profile for XP/streak data
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", userId)]
      );

      const profile = profiles.documents[0] as unknown as UserProfile | undefined;

      // Get today's daily set
      const today = new Date().toISOString().split("T")[0];
      const dailySets = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_DAILY_SETS_COLLECTION!,
        [
          Query.equal("userId", userId),
          Query.equal("date", today),
        ]
      );

      const todaySet = dailySets.documents[0];

      return {
        totalXp: profile?.totalXp ?? 0,
        currentLevel: profile?.currentLevel ?? 1,
        currentStreak: profile?.currentStreak ?? 0,
        longestStreak: profile?.longestStreak ?? 0,
        dailyExerciseCount: profile?.dailyExerciseCount ?? 5,
        todayCompleted: todaySet?.completedCount ?? 0,
        todayTotal: todaySet?.totalCount ?? profile?.dailyExerciseCount ?? 5,
        hasTodaySet: !!todaySet,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        dailyExerciseCount: 5,
        todayCompleted: 0,
        todayTotal: 5,
        hasTodaySet: false,
      };
    }
  }),
});
