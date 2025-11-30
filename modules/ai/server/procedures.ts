// modules/ai/server/procedures.ts
// tRPC router for AI services via Vercel AI Gateway

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { generateQuestionWithRetry } from "./services/question-generation.service";
import {
  generateProgressiveHint,
  generateEncouragement,
  analyzeAttempt,
} from "./services/socratic-tutor.service";
import {
  analyzeHandwrittenSolution,
  validateImageReadability,
} from "./services/image-analysis.service";
import { createGatewayOptions, GATEWAY_CONFIG } from "../config";

export const aiRouter = createTRPCRouter({
  /**
   * Generate a new question for a topic
   */
  generateQuestion: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        questionType: z.string().optional(),
        locale: z.enum(["en", "he"]).optional().default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const question = await generateQuestionWithRetry({
        topicId: input.topicId,
        difficulty: input.difficulty,
        questionType: input.questionType,
        locale: input.locale,
        userId: ctx.session.userId, // Pass userId for analytics
      });

      return question;
    }),

  /**
   * Get a Socratic hint for a problem
   */
  getHint: protectedProcedure
    .input(
      z.object({
        questionText: z.string(),
        correctAnswer: z.string(),
        userAttempt: z.string().optional(),
        previousHints: z.array(z.string()).optional(),
        locale: z.enum(["en", "he"]).optional().default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hint = await generateProgressiveHint({
        questionText: input.questionText,
        correctAnswer: input.correctAnswer,
        userAttempt: input.userAttempt,
        previousHints: input.previousHints,
        locale: input.locale,
        userId: ctx.session.userId, // Pass userId for analytics
      });

      return hint;
    }),

  /**
   * Get encouragement message
   */
  getEncouragement: protectedProcedure
    .input(
      z.object({
        questionText: z.string(),
        locale: z.enum(["en", "he"]).optional().default("en"),
      })
    )
    .query(async ({ input }) => {
      const message = await generateEncouragement(
        input.questionText,
        input.locale
      );

      return { message };
    }),

  /**
   * Analyze a student's attempt (for partial credit)
   */
  analyzeAttempt: protectedProcedure
    .input(
      z.object({
        questionText: z.string(),
        correctAnswer: z.string(),
        userAttempt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const analysis = await analyzeAttempt(
        input.questionText,
        input.correctAnswer,
        input.userAttempt,
        ctx.session.userId // Pass userId for analytics
      );

      return analysis;
    }),

  /**
   * Analyze handwritten solution image
   * Accepts either a URL or base64 data URL (data:image/...)
   */
  analyzeImage: protectedProcedure
    .input(
      z.object({
        imageData: z.string().min(1), // URL or base64 data URL
        questionText: z.string(),
        correctAnswer: z.string(),
        locale: z.enum(["en", "he"]).optional().default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const analysis = await analyzeHandwrittenSolution({
        imageUrl: input.imageData, // Service handles both URL and base64
        questionText: input.questionText,
        correctAnswer: input.correctAnswer,
        locale: input.locale,
        userId: ctx.session.userId, // Pass userId for analytics
      });

      return analysis;
    }),

  /**
   * Validate image quality before analysis
   * Accepts either a URL or base64 data URL
   */
  validateImage: protectedProcedure
    .input(
      z.object({
        imageData: z.string().min(1), // URL or base64 data URL
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await validateImageReadability(
        input.imageData,
        ctx.session.userId // Pass userId for analytics
      );

      return result;
    }),

  /**
   * Simple test endpoint to verify AI Gateway is working
   */
  testConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Quick test with minimal prompt using AI Gateway
      const { generateText, gateway } = await import("ai");

      // Gateway options with failover
      const gatewayOptions = createGatewayOptions({
        userId: ctx.session.userId,
        tags: ["test-connection"],
        enableFailover: true,
      });

      const model = gateway(GATEWAY_CONFIG.primaryModel);

      const { text } = await generateText({
        model,
        prompt: "Say 'AI connection successful!' in exactly 3 words.",
        maxOutputTokens: 20,
        providerOptions: gatewayOptions,
      });

      return {
        success: true,
        message: text.trim(),
        model: `${GATEWAY_CONFIG.primaryModel} (via AI Gateway)`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        model: `${GATEWAY_CONFIG.primaryModel} (via AI Gateway)`,
        timestamp: new Date().toISOString(),
      };
    }
  }),
});
