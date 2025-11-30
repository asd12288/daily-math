// modules/skill-tree/server/procedures.ts
// tRPC router for skill tree operations

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { SkillTreeService } from "./services/skill-tree.service";
import { TOPICS, BRANCHES, getTopicById } from "../config/topics";

export const skillTreeRouter = createTRPCRouter({
  /**
   * Get the full skill tree state for the current user
   */
  getState: protectedProcedure.query(async ({ ctx }) => {
    return await SkillTreeService.getSkillTreeState(ctx.session.userId);
  }),

  /**
   * Get progress for a single topic
   */
  getTopicProgress: protectedProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await SkillTreeService.getTopicProgress(
        ctx.session.userId,
        input.topicId
      );
    }),

  /**
   * Update progress after answering a question
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await SkillTreeService.updateProgress(
        ctx.session.userId,
        input.topicId,
        input.isCorrect
      );
    }),

  /**
   * Initialize skill tree for user (after diagnostic)
   */
  initializeFromDiagnostic: protectedProcedure
    .input(
      z.object({
        results: z.array(
          z.object({
            topicId: z.string(),
            passed: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await SkillTreeService.initializeForUser(ctx.session.userId, input.results);
      return { success: true };
    }),

  /**
   * Get all topics (static data, public)
   */
  getAllTopics: publicProcedure.query(() => {
    return TOPICS;
  }),

  /**
   * Get all branches (static data, public)
   */
  getAllBranches: publicProcedure.query(() => {
    return BRANCHES;
  }),

  /**
   * Get a single topic by ID (static data, public)
   */
  getTopic: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(({ input }) => {
      return getTopicById(input.topicId) || null;
    }),
});
