// modules/practice/hooks/use-practice.ts
// Client-side hooks for practice functionality

"use client";

import { trpc } from "@/trpc/client";

/**
 * Hook to get today's daily set
 */
export function useTodaySet() {
  const query = trpc.practice.getTodaySet.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    dailySet: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get a daily set by date
 */
export function useDailySetByDate(date: string) {
  const query = trpc.practice.getDailySetByDate.useQuery(
    { date },
    {
      enabled: !!date,
      staleTime: 1000 * 60 * 5,
    }
  );

  return {
    dailySet: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to submit an answer
 */
export function useSubmitAnswer() {
  const utils = trpc.useUtils();

  const mutation = trpc.practice.submitAnswer.useMutation({
    onSuccess: () => {
      // Invalidate daily set to refresh progress
      utils.practice.getTodaySet.invalidate();
      // Also invalidate skill tree for updated mastery
      utils.skillTree.getState.invalidate();
      // Invalidate gamification stats to reflect XP/streak changes
      utils.dashboard.getUserProfile.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });

  return {
    submitAnswer: mutation.mutate,
    submitAnswerAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to skip a problem
 */
export function useSkipProblem() {
  const utils = trpc.useUtils();

  const mutation = trpc.practice.skipProblem.useMutation({
    onSuccess: () => {
      utils.practice.getTodaySet.invalidate();
    },
  });

  return {
    skipProblem: mutation.mutate,
    skipProblemAsync: mutation.mutateAsync,
    isSkipping: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to get attempts for a daily set
 */
export function useAttempts(dailySetId: string | undefined) {
  const query = trpc.practice.getAttempts.useQuery(
    { dailySetId: dailySetId! },
    {
      enabled: !!dailySetId,
      staleTime: 1000 * 30,
    }
  );

  return {
    attempts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ========== Topic Practice Hooks ==========

/**
 * Hook to start a new topic practice session
 */
export function useStartTopicSession() {
  const utils = trpc.useUtils();

  const mutation = trpc.practice.startTopicSession.useMutation({
    onSuccess: () => {
      utils.practice.getActiveSessions.invalidate();
    },
  });

  return {
    startSession: mutation.mutate,
    startSessionAsync: mutation.mutateAsync,
    isStarting: mutation.isPending,
    error: mutation.error,
    session: mutation.data,
  };
}

/**
 * Hook to get a practice session by ID
 */
export function usePracticeSession(sessionId: string | undefined) {
  const query = trpc.practice.getSession.useQuery(
    { sessionId: sessionId! },
    {
      enabled: !!sessionId,
      staleTime: 1000 * 30,
    }
  );

  return {
    session: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get active (incomplete) practice sessions
 */
export function useActiveSessions() {
  const query = trpc.practice.getActiveSessions.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get practice session history
 */
export function useSessionHistory(limit: number = 10) {
  const query = trpc.practice.getSessionHistory.useQuery(
    { limit },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to submit an answer for a practice session
 */
export function useSubmitSessionAnswer() {
  const utils = trpc.useUtils();

  const mutation = trpc.practice.submitSessionAnswer.useMutation({
    onSuccess: (_, variables) => {
      // Invalidate the specific session
      utils.practice.getSession.invalidate({ sessionId: variables.sessionId });
      utils.practice.getActiveSessions.invalidate();
      // Also invalidate skill tree for updated mastery
      utils.skillTree.getState.invalidate();
    },
  });

  return {
    submitAnswer: mutation.mutate,
    submitAnswerAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
