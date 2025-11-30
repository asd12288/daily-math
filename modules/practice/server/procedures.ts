// modules/practice/server/procedures.ts
// tRPC router for practice operations

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { DailySetService } from "./services/daily-set.service";
import { TopicPracticeService } from "./services/topic-practice.service";

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
});
