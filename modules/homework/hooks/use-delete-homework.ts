// modules/homework/hooks/use-delete-homework.ts
// Hook for deleting homework

import { trpc } from "@/trpc/client";

export function useDeleteHomework() {
  const utils = trpc.useUtils();

  const mutation = trpc.homework.delete.useMutation({
    onSuccess: () => {
      // Invalidate the homework list
      utils.homework.list.invalidate();
    },
  });

  return {
    deleteHomework: mutation.mutate,
    deleteHomeworkAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
