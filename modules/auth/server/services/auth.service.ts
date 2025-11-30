// modules/auth/server/services/auth.service.ts
// Authentication service with Appwrite integration

import {
  createAdminClient,
  createSessionClient,
  setSessionCookie,
  deleteSessionCookie,
} from "@/lib/appwrite/server";
import { ID } from "node-appwrite";
import type { LoginSchema, RegisterSchema } from "../../lib/validation";
import { AUTH_MESSAGES } from "../../config/messages";

export class AuthService {
  /**
   * Login - Uses Admin client to create session
   * Sets httpOnly cookie for security
   */
  static async login(data: LoginSchema) {
    try {
      const { account } = await createAdminClient();

      const session = await account.createEmailPasswordSession(
        data.email,
        data.password
      );

      // Set httpOnly cookie with session secret
      await setSessionCookie(session.secret, session.expire);

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("Login error:", error);
      return { success: false, error: AUTH_MESSAGES.ERROR.INVALID_CREDENTIALS };
    }
  }

  /**
   * Register - Create user, create profile, then login
   * Auto-creates user profile document on registration
   */
  static async register(data: RegisterSchema) {
    try {
      const { users, databases } = await createAdminClient();

      // 1. Create user with Admin client
      const user = await users.create(
        ID.unique(),
        data.email,
        undefined, // phone
        data.password,
        data.displayName
      );

      // 2. Create user profile document (auto-create on register)
      try {
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
          user.$id, // Use user ID as document ID for easy lookup
          {
            userId: user.$id,
            email: data.email,
            displayName: data.displayName,
            totalXp: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            dailyExerciseCount: 5, // Default
            enrolledCourses: "[]",
            preferredTime: "09:00",
            emailReminders: true,
            streakWarnings: true,
            weeklyReport: false,
          }
        );
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail registration if profile creation fails
        // User can be created but profile will be missing
      }

      // 3. Login immediately after registration
      return await AuthService.login({
        email: data.email,
        password: data.password,
      });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const err = error as { type?: string; message?: string };
      if (
        err?.type === "user_already_exists" ||
        err?.message?.includes("email")
      ) {
        return { success: false, error: AUTH_MESSAGES.ERROR.EMAIL_EXISTS };
      }
      return { success: false, error: AUTH_MESSAGES.ERROR.UNKNOWN };
    }
  }

  /**
   * Logout - Delete cookie FIRST for instant UX, then cleanup Appwrite
   * Cookie deletion happens immediately, Appwrite cleanup is best-effort
   */
  static async logout() {
    // 1. Delete cookie immediately (fast logout)
    await deleteSessionCookie();

    // 2. Try to delete Appwrite session (don't block on this)
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch {
      // Session already invalid or cookie was deleted - that's fine
    }

    return { success: true };
  }

  /**
   * Get current user - uses DAL
   */
  static async getCurrentUser() {
    const { getSession } = await import("@/lib/dal");
    return await getSession();
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string) {
    try {
      const { account } = await createAdminClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await account.createRecovery(email, `${appUrl}/auth/reset-password`);
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      // Don't reveal if email exists or not for security
      return { success: true, error: null };
    }
  }

  /**
   * Complete password reset
   */
  static async resetPassword(
    userId: string,
    secret: string,
    password: string
  ) {
    try {
      const { account } = await createAdminClient();
      await account.updateRecovery(userId, secret, password);
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      return { success: false, error: AUTH_MESSAGES.ERROR.UNKNOWN };
    }
  }
}
