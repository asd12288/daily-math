// modules/homework/hooks/use-view-question.ts
// Hook for generating solution on-demand and marking as viewed

import { trpc } from "@/trpc/client";

export function useViewQuestion() {
  const utils = trpc.useUtils();

  const mutation = trpc.homework.viewQuestion.useMutation({
    onSuccess: () => {
      // Invalidate the homework detail to update viewed status and get new solution
      utils.homework.getById.invalidate();
      // Invalidate list to update XP counts
      utils.homework.list.invalidate();
    },
  });

  return {
    viewQuestion: mutation.mutate,
    viewQuestionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
