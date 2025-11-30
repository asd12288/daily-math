// modules/practice/server/procedures.ts
// tRPC router for practice operations

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { DailySetService } from "./services/daily-set.service";
import { TopicPracticeService } from "./services/topic-practice.service";
import { sendDailyReminder } from "@/modules/notifications/server/services/email.service";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";

export const practiceRouter = createTRPCRouter({
  /**
   * Get today's daily set (or create if doesn't exist)
   */
  getTodaySet: protectedProcedure.query(async ({ ctx }) => {
    return await DailySetService.getTodaySet(ctx.session.userId);
  }),

  /**
   * Get a specific daily set by date
   */
  getDailySetByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await DailySetService.getDailySetByDate(
        ctx.session.userId,
        input.date
      );
    }),

  /**
   * Submit an answer for a problem
   */
  submitAnswer: protectedProcedure
    .input(
      z.object({
        dailySetId: z.string(),
        problemId: z.string(),
        answerText: z.string().nullable(),
        answerImageUrl: z.string().nullable(),
        isSkipped: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await DailySetService.submitAnswer(
        ctx.session.userId,
        input.dailySetId,
        input.problemId,
        input.answerText,
        input.answerImageUrl,
        input.isSkipped
      );
    }),

  /**
   * Get attempts for a daily set
   */
  getAttempts: protectedProcedure
    .input(z.object({ dailySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await DailySetService.getAttempts(
        ctx.session.userId,
        input.dailySetId
      );
    }),

  /**
   * Skip a problem
   */
  skipProblem: protectedProcedure
    .input(
      z.object({
        dailySetId: z.string(),
        problemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await DailySetService.submitAnswer(
        ctx.session.userId,
        input.dailySetId,
        input.problemId,
        null,
        null,
        true
      );
    }),

  // ========== Topic Practice Procedures ==========

  /**
   * Start a new practice session for a topic
   */
  startTopicSession: protectedProcedure
    .input(z.object({ topicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await TopicPracticeService.startSession(
        ctx.session.userId,
        input.topicId
      );
    }),

  /**
   * Get a practice session by ID
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return await TopicPracticeService.getSession(input.sessionId);
    }),

  /**
   * Get active (incomplete) practice sessions for the user
   */
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    return await TopicPracticeService.getActiveSessions(ctx.session.userId);
  }),

  /**
   * Get practice session history
   */
  getSessionHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return await TopicPracticeService.getSessionHistory(
        ctx.session.userId,
        input.limit
      );
    }),

  /**
   * Submit an answer for a practice session problem
   */
  submitSessionAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        problemId: z.string(),
        answerText: z.string().nullable(),
        isSkipped: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await TopicPracticeService.submitAnswer(
        ctx.session.userId,
        input.sessionId,
        input.problemId,
        input.answerText,
        input.isSkipped
      );
    }),

  /**
   * Complete a practice session with all results
   * Syncs XP, updates streak, checks for level up
   */
  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        results: z.object({
          totalXp: z.number(),
          correctCount: z.number(),
          incorrectCount: z.number(),
          skippedCount: z.number(),
          results: z.array(
            z.object({
              problemId: z.string(),
              isCorrect: z.boolean(),
              isSkipped: z.boolean(),
              xpEarned: z.number(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await TopicPracticeService.completeSession(
        ctx.session.userId,
        input.sessionId,
        input.results
      );
    }),

  // ========== Daily Generation & Notification Procedures ==========

  /**
   * Get count of incomplete questions for today's set
   * Used for sidebar badge and notifications
   */
  getIncompleteCount: protectedProcedure.query(async ({ ctx }) => {
    const dailySet = await DailySetService.getTodaySet(ctx.session.userId);
    if (!dailySet) return 0;
    return dailySet.totalProblems - dailySet.completedCount;
  }),

  /**
   * Manually trigger daily set generation (for testing/dev)
   */
  triggerDailyGeneration: protectedProcedure.mutation(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0];

    // Check if set already exists for today
    const existing = await DailySetService.getDailySetByDate(ctx.session.userId, today);
    if (existing) {
      return {
        success: true,
        message: "Daily set already exists for today",
        dailySet: existing,
        created: false
      };
    }

    // Generate new set with AI
    const dailySet = await DailySetService.generateDailySet(
      ctx.session.userId,
      today,
      undefined,
      true // useAI
    );

    return {
      success: true,
      message: "Daily set generated successfully",
      dailySet,
      created: true
    };
  }),

  /**
   * Manually trigger reminder email (for testing/dev)
   */
  triggerReminderEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const { databases } = await createAdminClient();

    // Get user profile for email and preferences
    const profiles = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.usersProfile,
      [Query.equal("userId", ctx.session.userId), Query.limit(1)]
    );

    if (profiles.documents.length === 0) {
      return { success: false, message: "User profile not found" };
    }

    const profile = profiles.documents[0];

    // Get today's daily set
    const dailySet = await DailySetService.getTodaySet(ctx.session.userId);
    if (!dailySet) {
      return { success: false, message: "No daily set found for today" };
    }

    // Calculate estimated time (3 min per problem average)
    const estimatedMinutes = dailySet.totalProblems * 3;

    // Send email
    const sent = await sendDailyReminder(
      {
        email: profile.email || "",
        displayName: profile.displayName || "User",
        preferredLocale: profile.preferredLocale || "en",
      },
      {
        totalProblems: dailySet.totalProblems,
        focusTopicName: dailySet.focusTopicName,
        estimatedMinutes,
      }
    );

    return {
      success: sent,
      message: sent ? "Reminder email sent successfully" : "Failed to send email (check RESEND_API_KEY)"
    };
  }),
});
