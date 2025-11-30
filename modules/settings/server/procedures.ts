// modules/settings/server/procedures.ts
// Settings tRPC procedures for fetching and updating user settings

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import type { UserProfile } from "@/lib/appwrite/types";
import { updateSettingsSchema } from "../lib/validation";
import { TRPCError } from "@trpc/server";

export const settingsRouter = createTRPCRouter({
  /**
   * Get user settings (profile data relevant to settings)
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const { databases } = await createAdminClient();
    const { userId, email } = ctx.session;

    try {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        [Query.equal("userId", userId)]
      );

      if (profiles.documents.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const profile = profiles.documents[0] as unknown as UserProfile;

      return {
        displayName: profile.displayName,
        email: profile.email || email,
        avatarUrl: profile.avatarUrl,
        dailyExerciseCount: profile.dailyExerciseCount,
        preferredTime: profile.preferredTime,
        emailReminders: profile.emailReminders,
        streakWarnings: profile.streakWarnings,
        weeklyReport: profile.weeklyReport,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Error fetching user settings:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch settings",
      });
    }
  }),

  /**
   * Update user settings - auto-save single field
   */
  update: protectedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const { databases } = await createAdminClient();
      const { userId } = ctx.session;

      try {
        // Get the profile document ID (we use userId as doc ID)
        const profiles = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
          [Query.equal("userId", userId)]
        );

        if (profiles.documents.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User profile not found",
          });
        }

        const profileId = profiles.documents[0].$id;

        // Build update object with only defined fields
        const updateData: Record<string, unknown> = {};
        if (input.displayName !== undefined) {
          updateData.displayName = input.displayName;
        }
        if (input.dailyExerciseCount !== undefined) {
          updateData.dailyExerciseCount = input.dailyExerciseCount;
        }
        if (input.preferredTime !== undefined) {
          updateData.preferredTime = input.preferredTime;
        }
        if (input.emailReminders !== undefined) {
          updateData.emailReminders = input.emailReminders;
        }
        if (input.streakWarnings !== undefined) {
          updateData.streakWarnings = input.streakWarnings;
        }
        if (input.weeklyReport !== undefined) {
          updateData.weeklyReport = input.weeklyReport;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
          return { success: true };
        }

        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
          profileId,
          updateData
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating user settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settings",
        });
      }
    }),
});
