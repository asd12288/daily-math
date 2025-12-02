// modules/topics/hooks/use-topic.ts
// React hooks for topic data fetching

"use client";

import { trpc } from "@/trpc/client";

/**
 * Hook to fetch a single topic by ID
 */
export function useTopic(topicId: string) {
  return trpc.topics.getById.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch topic detail with branch and related topics
 */
export function useTopicDetail(topicId: string) {
  return trpc.topics.getDetail.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch all topics for a course
 */
export function useTopicsByCourse(courseId: string, includeInactive = false) {
  return trpc.topics.getByCourse.useQuery(
    { courseId, includeInactive },
    {
      enabled: !!courseId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch topics grouped by branch
 */
export function useTopicsGroupedByBranch(courseId: string) {
  return trpc.topics.getGroupedByBranch.useQuery(
    { courseId },
    {
      enabled: !!courseId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch all branches
 */
export function useBranches() {
  return trpc.topics.getAllBranches.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes (branches rarely change)
  });
}

/**
 * Hook to fetch formulas for a topic
 */
export function useTopicFormulas(topicId: string) {
  return trpc.topics.getFormulas.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch all formulas for a course (cheat sheet)
 */
export function useCourseFormulas(courseId: string) {
  return trpc.topics.getCourseFormulas.useQuery(
    { courseId },
    {
      enabled: !!courseId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to update topic theory (admin only)
 */
export function useUpdateTopicTheory() {
  const utils = trpc.useUtils();

  return trpc.topics.updateTheory.useMutation({
    onSuccess: (_, variables) => {
      // Invalidate topic queries
      utils.topics.getById.invalidate({ topicId: variables.topicId });
      utils.topics.getDetail.invalidate({ topicId: variables.topicId });
    },
  });
}

/**
 * Hook to update topic videos (admin only)
 */
export function useUpdateTopicVideos() {
  const utils = trpc.useUtils();

  return trpc.topics.updateVideos.useMutation({
    onSuccess: (_, variables) => {
      // Invalidate topic queries
      utils.topics.getById.invalidate({ topicId: variables.topicId });
      utils.topics.getDetail.invalidate({ topicId: variables.topicId });
    },
  });
}

/**
 * Hook to fetch exercises for a topic
 */
export function useTopicExercises(
  topicId: string,
  options?: {
    difficulty?: "easy" | "medium" | "hard";
    limit?: number;
  }
) {
  return trpc.topics.getExercises.useQuery(
    {
      topicId,
      difficulty: options?.difficulty,
      limit: options?.limit,
    },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch exercise count for a topic
 */
export function useTopicExerciseCount(topicId: string) {
  return trpc.topics.getExerciseCount.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
