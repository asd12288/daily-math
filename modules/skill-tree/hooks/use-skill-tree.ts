// modules/skill-tree/hooks/use-skill-tree.ts
// Client-side hooks for skill tree data

"use client";

import { trpc } from "@/trpc/client";

/**
 * Hook to get the full skill tree state
 */
export function useSkillTree() {
  const query = trpc.skillTree.getState.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  return {
    skillTree: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get progress for a single topic
 */
export function useTopicProgress(topicId: string) {
  const query = trpc.skillTree.getTopicProgress.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      staleTime: 1000 * 30, // 30 seconds
    }
  );

  return {
    topic: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to update progress after answering
 */
export function useUpdateProgress() {
  const utils = trpc.useUtils();

  const mutation = trpc.skillTree.updateProgress.useMutation({
    onSuccess: () => {
      // Invalidate skill tree state to refresh UI
      utils.skillTree.getState.invalidate();
    },
  });

  return {
    updateProgress: mutation.mutate,
    updateProgressAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to initialize skill tree from diagnostic results
 */
export function useInitializeSkillTree() {
  const utils = trpc.useUtils();

  const mutation = trpc.skillTree.initializeFromDiagnostic.useMutation({
    onSuccess: () => {
      utils.skillTree.getState.invalidate();
    },
  });

  return {
    initialize: mutation.mutate,
    initializeAsync: mutation.mutateAsync,
    isInitializing: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to get all topics (static data)
 */
export function useAllTopics() {
  const query = trpc.skillTree.getAllTopics.useQuery(undefined, {
    staleTime: Infinity, // Static data, never stale
  });

  return {
    topics: query.data,
    isLoading: query.isLoading,
  };
}

/**
 * Hook to get all branches (static data)
 */
export function useAllBranches() {
  const query = trpc.skillTree.getAllBranches.useQuery(undefined, {
    staleTime: Infinity, // Static data, never stale
  });

  return {
    branches: query.data,
    isLoading: query.isLoading,
  };
}
