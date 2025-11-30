// modules/courses/hooks/use-courses.ts
// Client-side hooks for courses module

import { trpc } from "@/trpc/client";

/**
 * Get all active courses (for landing page or course list)
 */
export function useCourses() {
  const { data: courses, isLoading, error } = trpc.courses.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // 1 hour - courses don't change often
  });

  return { courses: courses ?? [], isLoading, error };
}

/**
 * Get courses with user progress
 */
export function useCoursesWithProgress() {
  const { data: courses, isLoading, error, refetch } = trpc.courses.getWithProgress.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  return { courses: courses ?? [], isLoading, error, refetch };
}

/**
 * Get course detail with skill tree data
 */
export function useCourseDetail(courseId: string) {
  const { data: courseDetail, isLoading, error, refetch } = trpc.courses.getDetail.useQuery(
    { courseId },
    {
      enabled: !!courseId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  return { courseDetail, isLoading, error, refetch };
}

/**
 * Get exercises for a topic
 */
export function useTopicExercises(
  topicId: string,
  options: { difficulty?: "easy" | "medium" | "hard"; limit?: number } = {}
) {
  const { data: exercises, isLoading, error, refetch } = trpc.courses.getExercises.useQuery(
    { topicId, ...options },
    {
      enabled: !!topicId,
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  return { exercises: exercises ?? [], isLoading, error, refetch };
}

/**
 * Get exercises for a practice session
 */
export function useSessionExercises(topicId: string, excludeIds: string[] = []) {
  const { data: exercises, isLoading, error, refetch } = trpc.courses.getSessionExercises.useQuery(
    { topicId, excludeIds },
    {
      enabled: !!topicId,
      staleTime: 0, // Always fetch fresh for new sessions
    }
  );

  return { exercises: exercises ?? [], isLoading, error, refetch };
}
