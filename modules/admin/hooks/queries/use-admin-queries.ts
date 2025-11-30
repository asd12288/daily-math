// modules/admin/hooks/queries/use-admin-queries.ts
// Query hooks for admin module

import { trpc } from "@/trpc/client";
import type { QuestionFilters } from "../../types";

/**
 * Hook to fetch paginated questions with filters
 */
export function useQuestions(filters: QuestionFilters = {}) {
  return trpc.admin.getQuestions.useQuery(
    {
      courseId: filters.courseId,
      topicId: filters.topicId,
      difficulty: filters.difficulty,
      answerType: filters.answerType,
      search: filters.search,
      page: filters.page || 1,
      limit: filters.limit || 20,
    },
    {
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

/**
 * Hook to fetch a single question by ID
 */
export function useQuestion(questionId: string | undefined) {
  return trpc.admin.getQuestion.useQuery(
    { questionId: questionId! },
    {
      enabled: !!questionId,
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

/**
 * Hook to fetch admin statistics
 */
export function useAdminStats() {
  return trpc.admin.getStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
