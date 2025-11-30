// modules/onboarding/server/procedures.ts
// tRPC router for onboarding flow

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { DiagnosticService } from "./services/diagnostic.service";

export const onboardingRouter = createTRPCRouter({
  /**
   * Get current onboarding state
   */
  getState: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;
    let state = await DiagnosticService.getOnboardingState(userId);

    // Initialize if not exists
    if (!state) {
      state = await DiagnosticService.initializeOnboarding(userId);
    }

    return state;
  }),

  /**
   * Check if onboarding is complete
   */
  isComplete: protectedProcedure.query(async ({ ctx }) => {
    const state = await DiagnosticService.getOnboardingState(ctx.session.userId);
    return { isComplete: state?.isCompleted ?? false };
  }),

  /**
   * Update onboarding step
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        step: z.enum(["welcome", "experience", "diagnostic", "results", "complete"]),
        experienceLevel: z
          .enum(["beginner", "some", "comfortable", "advanced"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await DiagnosticService.updateStep(
        ctx.session.userId,
        input.step,
        input.experienceLevel
      );
      return { success: true };
    }),

  /**
   * Get diagnostic questions
   */
  getDiagnosticQuestions: protectedProcedure.query(async () => {
    const questions = DiagnosticService.getDiagnosticQuestions();
    return questions;
  }),

  /**
   * Submit a diagnostic answer
   */
  submitDiagnosticAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        userAnswer: z.string().nullable(),
        timeSpentSeconds: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await DiagnosticService.submitDiagnosticAnswer(
        ctx.session.userId,
        input.questionId,
        input.userAnswer,
        input.timeSpentSeconds
      );
      return result;
    }),

  /**
   * Complete diagnostic test and get results
   */
  completeDiagnostic: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await DiagnosticService.completeDiagnostic(ctx.session.userId);
    return result;
  }),

  /**
   * Complete entire onboarding flow
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        dailyGoal: z.number().min(1).max(10),
        reminderTime: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await DiagnosticService.completeOnboarding(ctx.session.userId, {
        dailyGoal: input.dailyGoal,
        reminderTime: input.reminderTime,
      });
      return { success: true };
    }),
});
