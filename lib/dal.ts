// lib/dal.ts - Data Access Layer
// Secure session verification with React cache for request deduplication

import { cache } from "react";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import type { UserRole, UserProfile } from "@/lib/appwrite/types";

export interface SessionData {
  isAuth: true;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Verify session with Appwrite - cached per request
 * REDIRECTS to login if not authenticated
 *
 * Use this in: Server Components, tRPC procedures, Server Actions
 * where authentication is REQUIRED
 */
export const verifySession = cache(async (): Promise<SessionData> => {
  try {
    // Use session client to verify user is authenticated
    const { account } = await createSessionClient();
    const user = await account.get();

    // Use admin client to fetch profile (has full permissions)
    const { databases } = await createAdminClient();

    // Fetch user profile to get role
    let role: UserRole = "user";
    try {
      const profileResponse = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );
      if (profileResponse.documents.length > 0) {
        const profile = profileResponse.documents[0] as unknown as UserProfile;
        // Handle case where role might be undefined in database
        role = (profile.role as UserRole) || "user";
        console.log(`[DAL verifySession] User ${user.$id} has role: ${role}`);
      } else {
        console.log(`[DAL verifySession] No profile found for user ${user.$id}, defaulting to 'user'`);
      }
    } catch (error) {
      // If profile fetch fails, default to "user" role
      console.warn("[DAL verifySession] Failed to fetch user profile:", error);
    }

    return {
      isAuth: true,
      userId: user.$id,
      email: user.email,
      name: user.name,
      role,
    };
  } catch {
    redirect("/auth/login");
  }
});

/**
 * Get session without redirect - returns null if not authenticated
 *
 * Use for optional auth checks (e.g., showing different UI for logged in users)
 * or when you want to handle the unauthenticated case yourself
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    // Use session client to verify user is authenticated
    const { account } = await createSessionClient();
    const user = await account.get();

    // Use admin client to fetch profile (has full permissions)
    const { databases } = await createAdminClient();

    // Fetch user profile to get role
    let role: UserRole = "user";
    try {
      const profileResponse = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );
      console.log(`[getSession] Profile query for user ${user.$id}:`, profileResponse.documents.length > 0 ? "found" : "not found");
      if (profileResponse.documents.length > 0) {
        const profile = profileResponse.documents[0] as unknown as UserProfile;
        console.log(`[getSession] Profile data - role field:`, profile.role);
        role = (profile.role as UserRole) || "user";
        console.log(`[getSession] Final role for user ${user.$id}: ${role}`);
      }
    } catch (error) {
      // If profile fetch fails, default to "user" role
      console.error("[getSession] Failed to fetch profile:", error);
    }

    return {
      isAuth: true,
      userId: user.$id,
      email: user.email,
      name: user.name,
      role,
    };
  } catch {
    return null;
  }
});
