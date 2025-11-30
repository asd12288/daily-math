import { trpc } from "@/trpc/client";

export function useUserSettings() {
  return trpc.settings.get.useQuery();
}
