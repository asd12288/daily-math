// modules/homework/hooks/use-homework-list.ts
// Hook for fetching homework list

import { trpc } from "@/trpc/client";
import type { HomeworkStatus } from "../types";

interface UseHomeworkListOptions {
  limit?: number;
  status?: "all" | HomeworkStatus;
}

export function useHomeworkList(options: UseHomeworkListOptions = {}) {
  const { limit = 20, status = "all" } = options;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.homework.list.useQuery({ limit, offset: 0, status });

  return {
    homeworks: data?.homeworks ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    // Simplified pagination - can be enhanced later
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
  };
}
