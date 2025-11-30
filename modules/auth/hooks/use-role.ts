// modules/auth/hooks/use-role.ts
// Reusable hook for role-based access control

import { useUser } from "@/shared/context/UserContext";
import type { UserRole } from "@/lib/appwrite/types";

/**
 * Hook for checking user roles and permissions
 * Provides role information and helper functions for role-based UI rendering
 *
 * @example
 * const { isAdmin, hasRole } = useRole();
 *
 * if (isAdmin) {
 *   // Show admin-only content
 * }
 *
 * if (hasRole("admin")) {
 *   // Same as isAdmin
 * }
 */
export function useRole() {
  const { role } = useUser();

  return {
    /**
     * Current user's role
     * Defaults to "user" if not set
     */
    role: role ?? ("user" as UserRole),

    /**
     * Whether the current user is an admin
     */
    isAdmin: role === "admin",

    /**
     * Check if user has a specific role
     */
    hasRole: (requiredRole: UserRole) => role === requiredRole,

    /**
     * Check if user has one of the specified roles
     */
    hasAnyRole: (roles: UserRole[]) => roles.includes(role ?? "user"),
  };
}
