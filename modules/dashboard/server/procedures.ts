// modules/dashboard/server/procedures.ts
// Dashboard tRPC procedures for fetching user profile and stats

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import type { UserProfile } from "@/lib/appwrite/types";
import { DailySetService } from "@/modules/practice/server/services/daily-set.service";
import { coursesService } from "@/modules/courses/server/services/courses.service";
import { generateDailyInsight, type DailyInsight } from "@/modules/ai/server/services/daily-insight.service";

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

  /**
   * Get all dashboard data in one aggregated call
   * Includes: stats, daily insight, today's practice, recent homework, enrolled courses
   */
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const { databases } = await createAdminClient();
    const { userId } = ctx.session;

    try {
      // 1. Get user profile
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", userId)]
      );
      const profile = profiles.documents[0] as unknown as UserProfile | undefined;

      // Parse enrolled courses
      let enrolledCourseIds: string[] = [];
      if (profile?.enrolledCourses) {
        try {
          enrolledCourseIds = typeof profile.enrolledCourses === "string"
            ? JSON.parse(profile.enrolledCourses)
            : profile.enrolledCourses;
        } catch {
          enrolledCourseIds = [];
        }
      }

      // 2. Get today's daily set
      let todaysPractice = null;
      try {
        todaysPractice = await DailySetService.getTodaySet(userId);
      } catch {
        // Daily set might not exist yet
      }

      // 3. Get recent homework (last 3)
      let recentHomework: Array<{
        id: string;
        title: string;
        status: string;
        questionCount: number;
        viewedCount: number;
        xpEarned: number;
        createdAt: string;
      }> = [];
      try {
        const homeworkDocs = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.homeworks,
          [
            Query.equal("userId", userId),
            Query.orderDesc("$createdAt"),
            Query.limit(3),
          ]
        );
        recentHomework = homeworkDocs.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title as string,
          status: doc.status as string,
          questionCount: doc.questionCount as number,
          viewedCount: doc.viewedCount as number,
          xpEarned: doc.xpEarned as number,
          createdAt: doc.$createdAt as string,
        }));
      } catch {
        // Homework might not exist
      }

      // 4. Get enrolled courses with progress (max 2 for display)
      let enrolledCourses: Array<{
        id: string;
        name: string;
        nameHe: string;
        icon: string;
        color: string;
        overallProgress: number;
        totalTopics: number;
        masteredTopics: number;
        nextTopicId?: string;
        nextTopicName?: string;
        nextTopicNameHe?: string;
      }> = [];
      try {
        const coursesWithProgress = await coursesService.getCoursesWithProgress(userId);
        // Filter to enrolled and take first 2
        enrolledCourses = coursesWithProgress
          .filter((c) => c.isEnrolled)
          .slice(0, 2)
          .map((c) => ({
            id: c.id,
            name: c.name,
            nameHe: c.nameHe,
            icon: c.icon,
            color: c.color,
            overallProgress: c.overallProgress,
            totalTopics: c.totalTopics,
            masteredTopics: c.masteredTopics,
            // TODO: Add next topic logic based on skill tree
            nextTopicId: undefined,
            nextTopicName: undefined,
            nextTopicNameHe: undefined,
          }));
      } catch {
        // Courses might not exist
      }

      // 5. Get daily insight (AI-generated, cached per day)
      let dailyInsight: DailyInsight | null = null;
      try {
        if (enrolledCourseIds.length > 0) {
          dailyInsight = await generateDailyInsight(userId, enrolledCourseIds);
        }
      } catch (error) {
        console.error("Failed to generate daily insight:", error);
      }

      // 6. Build stats
      const stats = {
        totalXp: profile?.totalXp ?? 0,
        currentLevel: profile?.currentLevel ?? 1,
        currentStreak: profile?.currentStreak ?? 0,
        longestStreak: profile?.longestStreak ?? 0,
        todayCompleted: todaysPractice?.completedCount ?? 0,
        todayTotal: todaysPractice?.totalProblems ?? profile?.dailyExerciseCount ?? 5,
      };

      return {
        stats,
        dailyInsight,
        todaysPractice,
        recentHomework,
        enrolledCourses,
        profile,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }),
});
