// modules/admin/hooks/mutations/use-admin-mutations.ts
// Mutation hooks for admin module

import { trpc } from "@/trpc/client";

/**
 * Hook to create a new question
 */
export function useCreateQuestion() {
  const utils = trpc.useUtils();

  return trpc.admin.createQuestion.useMutation({
    onSuccess: () => {
      // Invalidate questions list to refetch
      utils.admin.getQuestions.invalidate();
      utils.admin.getStats.invalidate();
    },
  });
}

/**
 * Hook to update an existing question
 */
export function useUpdateQuestion() {
  const utils = trpc.useUtils();

  return trpc.admin.updateQuestion.useMutation({
    onSuccess: (_, variables) => {
      // Invalidate specific question and list
      utils.admin.getQuestion.invalidate({ questionId: variables.questionId });
      utils.admin.getQuestions.invalidate();
    },
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion() {
  const utils = trpc.useUtils();

  return trpc.admin.deleteQuestion.useMutation({
    onSuccess: () => {
      // Invalidate questions list
      utils.admin.getQuestions.invalidate();
      utils.admin.getStats.invalidate();
    },
  });
}

/**
 * Hook for bulk operations (activate, deactivate, delete)
 */
export function useBulkOperation() {
  const utils = trpc.useUtils();

  return trpc.admin.bulkOperation.useMutation({
    onSuccess: () => {
      // Invalidate all question-related queries
      utils.admin.getQuestions.invalidate();
      utils.admin.getStats.invalidate();
    },
  });
}
