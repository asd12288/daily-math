import { trpc } from "@/trpc/client";
import { toast } from "@/shared/hooks";
import type { UpdateSettingsSchema } from "../../lib/validation";

interface UseUpdateSettingsOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  showToast?: boolean;
}

export function useUpdateSettings(options?: UseUpdateSettingsOptions) {
  const utils = trpc.useUtils();
  const showToast = options?.showToast ?? true;

  return trpc.settings.update.useMutation({
    onSuccess: () => {
      // Invalidate settings query to refetch fresh data
      utils.settings.get.invalidate();
      if (showToast) {
        toast.success("Saved", "Your settings have been updated.");
      }
      options?.onSuccess?.();
    },
    onError: (error) => {
      if (showToast) {
        toast.error("Error", "Failed to save settings. Please try again.");
      }
      options?.onError?.(error);
    },
  });
}

// Convenience hook for auto-saving individual fields
export function useAutoSaveSetting(options?: UseUpdateSettingsOptions) {
  const mutation = useUpdateSettings(options);

  const save = (field: keyof UpdateSettingsSchema, value: unknown) => {
    mutation.mutate({ [field]: value } as UpdateSettingsSchema);
  };

  return {
    save,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
