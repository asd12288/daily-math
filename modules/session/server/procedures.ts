// modules/session/server/procedures.ts
// tRPC router for session module

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { SessionService } from "./services/session.service";
import {
  createSessionSchema,
  getSessionSchema,
  markViewedSchema,
  completeSessionSchema,
  navigateSessionSchema,
  listActiveSessionsSchema,
  deleteSessionSchema,
} from "../lib/validation";

export const sessionRouter = createTRPCRouter({
  /**
   * Create a new practice session
   */
  create: protectedProcedure
    .input(createSessionSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Get locale from user preferences or context
      const locale = "en";

      const session = await SessionService.createSession(
        ctx.session.userId,
        input,
        locale as "en" | "he"
      );

      return session;
    }),

  /**
   * Get a session by ID
   */
  getById: protectedProcedure
    .input(getSessionSchema)
    .query(async ({ ctx, input }) => {
      const session = await SessionService.getSession(input.sessionId);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Verify ownership
      if (session.userId !== ctx.session.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      return session;
    }),

  /**
   * Mark a question as viewed (reveal solution)
   */
  markViewed: protectedProcedure
    .input(markViewedSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await SessionService.markQuestionViewed(
          input.sessionId,
          input.questionId,
          ctx.session.userId
        );
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Session not found") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Session not found",
            });
          }
          if (error.message === "Unauthorized") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have access to this session",
            });
          }
          if (error.message === "Question not found in session") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Question not found in session",
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Navigate to a specific question index
   */
  navigate: protectedProcedure
    .input(navigateSessionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await SessionService.navigateToIndex(
          input.sessionId,
          input.index,
          ctx.session.userId
        );
        return session;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Session not found") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Session not found",
            });
          }
          if (error.message === "Unauthorized") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have access to this session",
            });
          }
          if (error.message === "Index out of bounds") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Question index out of bounds",
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Complete a session
   */
  complete: protectedProcedure
    .input(completeSessionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const results = await SessionService.completeSession(
          input.sessionId,
          ctx.session.userId
        );
        return results;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Session not found") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Session not found",
            });
          }
          if (error.message === "Unauthorized") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have access to this session",
            });
          }
        }
        throw error;
      }
    }),

  /**
   * List active (incomplete) sessions
   */
  listActive: protectedProcedure
    .input(listActiveSessionsSchema)
    .query(async ({ ctx, input }) => {
      const sessions = await SessionService.listActiveSessions(
        ctx.session.userId,
        input.limit
      );
      return sessions;
    }),

  /**
   * Delete a session
   */
  delete: protectedProcedure
    .input(deleteSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const success = await SessionService.deleteSession(
        input.sessionId,
        ctx.session.userId
      );

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or you don't have permission to delete it",
        });
      }

      return { success: true };
    }),

  /**
   * Get source info (topic/homework name) for session creation UI
   */
  getSourceInfo: protectedProcedure
    .input(
      z.object({
        source: z.enum(["topic", "homework", "daily"]),
        sourceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const info = await SessionService.getSourceInfo(input.source, input.sourceId);

      if (!info) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Source not found",
        });
      }

      return info;
    }),

  /**
   * Get available question counts by difficulty
   */
  getQuestionCounts: protectedProcedure
    .input(
      z.object({
        source: z.enum(["topic", "homework", "daily"]),
        sourceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const counts = await SessionService.getAvailableQuestionCount(
        input.source,
        input.sourceId
      );
      return counts;
    }),

  /**
   * Batch sync session state (for instant local-first UI)
   * Batches multiple actions into a single DB update
   */
  batchSync: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        actions: z.array(
          z.object({
            type: z.enum(["reveal", "navigate", "complete"]),
            questionId: z.string().optional(),
            index: z.number().optional(),
            timestamp: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await SessionService.batchSync(
          input.sessionId,
          input.actions,
          ctx.session.userId
        );
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Session not found") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Session not found",
            });
          }
          if (error.message === "Unauthorized") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have access to this session",
            });
          }
        }
        throw error;
      }
    }),
});
