"use client";

// modules/auth/hooks/mutations/use-auth-mutations.ts
// Auth mutation hooks with proper cache invalidation and navigation

import { trpc } from "@/trpc/client";
import { useRouter } from "@/i18n/routing";
import { AUTH_ROUTES } from "../../config/routes";

/**
 * Login mutation hook
 * On success: invalidates cache, redirects to dashboard, refreshes server components
 */
export function useLogin() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.login.useMutation({
    onSuccess: () => {
      // Invalidate all cached queries (important for session-dependent data)
      utils.invalidate();
      // Navigate to dashboard
      router.push(AUTH_ROUTES.DASHBOARD);
      // Force server component refresh to pick up new session
      router.refresh();
    },
  });
}

/**
 * Register mutation hook
 * On success: invalidates cache, redirects to dashboard, refreshes server components
 */
export function useRegister() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.invalidate();
      router.push(AUTH_ROUTES.DASHBOARD);
      router.refresh();
    },
  });
}

/**
 * Logout mutation hook
 * On success: invalidates cache, redirects to login, refreshes server components
 */
export function useLogout() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Clear all cached queries immediately
      utils.invalidate();
      // Redirect to login page
      router.push(AUTH_ROUTES.LOGIN);
      // Force server component refresh
      router.refresh();
    },
  });
}

/**
 * Forgot password mutation hook
 */
export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation();
}
