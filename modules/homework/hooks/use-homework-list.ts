// modules/homework/hooks/use-homework-list.ts
// Hook for fetching homework list with filters

import { trpc } from "@/trpc/client";
import type { HomeworkStatus, HomeworkDateRange, HomeworkFilterCounts } from "../types";

interface UseHomeworkListOptions {
  limit?: number;
  status?: "all" | HomeworkStatus;
  subject?: string;
  dateRange?: HomeworkDateRange;
}

const DEFAULT_FILTER_COUNTS: HomeworkFilterCounts = {
  bySubject: {},
  byStatus: { all: 0, uploading: 0, processing: 0, completed: 0, failed: 0 },
  byDateRange: { all: 0, today: 0, week: 0, month: 0 },
  total: 0,
};

export function useHomeworkList(options: UseHomeworkListOptions = {}) {
  const { limit = 50, status = "all", subject = "all", dateRange = "all" } = options;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.homework.list.useQuery(
    { limit, offset: 0, status, subject, dateRange },
    {
      // Keep previous data while fetching new data (prevents flicker on filter change)
      placeholderData: (previousData) => previousData,
    }
  );

  return {
    homeworks: data?.homeworks ?? [],
    total: data?.total ?? 0,
    filterCounts: data?.filterCounts ?? DEFAULT_FILTER_COUNTS,
    isLoading,
    error,
    refetch,
    // Simplified pagination - can be enhanced later
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
  };
}
