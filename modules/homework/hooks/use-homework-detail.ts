// modules/homework/hooks/use-homework-detail.ts
// Hook for fetching single homework with questions

import { trpc } from "@/trpc/client";

export function useHomeworkDetail(homeworkId: string | undefined) {
  const {
    data: homework,
    isLoading,
    error,
    refetch,
  } = trpc.homework.getById.useQuery(
    { homeworkId: homeworkId! },
    {
      enabled: !!homeworkId,
    }
  );

  return {
    homework,
    isLoading,
    error,
    refetch,
  };
}
