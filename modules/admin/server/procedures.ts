// modules/admin/server/procedures.ts
// tRPC router for admin operations

import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  questionFiltersSchema,
  questionFormSchema,
  questionIdSchema,
  bulkOperationSchema,
} from "../lib/validation";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUpdateQuestions,
  bulkDeleteQuestions,
  getAdminStats,
} from "./services/question-service";

export const adminRouter = createTRPCRouter({
  /**
   * Get paginated list of questions with filters
   */
  getQuestions: adminProcedure
    .input(questionFiltersSchema)
    .query(async ({ input }) => {
      return getQuestions(input);
    }),

  /**
   * Get a single question by ID
   */
  getQuestion: adminProcedure
    .input(questionIdSchema)
    .query(async ({ input }) => {
      const question = await getQuestionById(input.questionId);

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      return question;
    }),

  /**
   * Create a new question
   */
  createQuestion: adminProcedure
    .input(questionFormSchema)
    .mutation(async ({ input }) => {
      return createQuestion(input);
    }),

  /**
   * Update an existing question
   */
  updateQuestion: adminProcedure
    .input(
      questionIdSchema.merge(questionFormSchema.partial())
    )
    .mutation(async ({ input }) => {
      const { questionId, ...data } = input;

      // Verify question exists
      const existing = await getQuestionById(questionId);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      return updateQuestion(questionId, data);
    }),

  /**
   * Delete a question
   */
  deleteQuestion: adminProcedure
    .input(questionIdSchema)
    .mutation(async ({ input }) => {
      // Verify question exists
      const existing = await getQuestionById(input.questionId);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await deleteQuestion(input.questionId);
      return { success: true };
    }),

  /**
   * Bulk operations on questions
   */
  bulkOperation: adminProcedure
    .input(bulkOperationSchema)
    .mutation(async ({ input }) => {
      const { questionIds, operation } = input;

      if (operation === "delete") {
        const deleted = await bulkDeleteQuestions(questionIds);
        return { success: true, affected: deleted };
      }

      const updated = await bulkUpdateQuestions(questionIds, operation);
      return { success: true, affected: updated };
    }),

  /**
   * Get admin statistics
   */
  getStats: adminProcedure.query(async () => {
    return getAdminStats();
  }),
});
