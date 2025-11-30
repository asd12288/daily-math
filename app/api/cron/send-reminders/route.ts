// app/api/cron/send-reminders/route.ts
// Cron job to send daily reminder emails at 7 AM (Israel time)

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { sendDailyReminder } from "@/modules/notifications/server/services/email.service";
import {
  verifyCronSecret,
  unauthorizedResponse,
  cronResponse,
  getIsraelDate,
} from "@/lib/cron-auth";

// Maximum execution time for cron
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    console.error("[Cron:Reminders] Unauthorized request");
    return unauthorizedResponse();
  }

  const startTime = Date.now();
  console.log("[Cron:Reminders] Starting reminder emails...");

  try {
    const today = getIsraelDate();
    console.log(`[Cron:Reminders] Processing for date: ${today}`);

    // Get users who have email reminders enabled
    const users = await getUsersWithRemindersEnabled();
    console.log(`[Cron:Reminders] Found ${users.length} users with reminders enabled`);

    if (users.length === 0) {
      return cronResponse({
        success: true,
        message: "No users with reminders enabled",
        stats: { sent: 0, failed: 0, skipped: 0 },
      });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Process users in batches
    const BATCH_SIZE = 10;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Get user's daily set for today
            const dailySet = await getDailySetForUser(user.userId, today);

            if (!dailySet) {
              console.log(`[Cron:Reminders] No daily set for user ${user.userId}, skipping`);
              skipped++;
              return;
            }

            // Skip if already completed
            if (dailySet.isCompleted) {
              console.log(`[Cron:Reminders] User ${user.userId} already completed, skipping`);
              skipped++;
              return;
            }

            // Calculate estimated time (3 min per problem average)
            const estimatedMinutes = dailySet.totalProblems * 3;

            // Send email
            const success = await sendDailyReminder(
              {
                email: user.email,
                displayName: user.displayName,
                preferredLocale: user.preferredLocale,
              },
              {
                totalProblems: dailySet.totalProblems,
                focusTopicName: dailySet.focusTopicName,
                estimatedMinutes,
              }
            );

            if (success) {
              sent++;
            } else {
              failed++;
            }
          } catch (error) {
            console.error(`[Cron:Reminders] Error for user ${user.userId}:`, error);
            failed++;
          }
        })
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron:Reminders] Completed in ${duration}ms`);

    return cronResponse({
      success: true,
      message: `Sent ${sent} reminder emails`,
      stats: { sent, failed, skipped },
      durationMs: duration,
    });
  } catch (error) {
    console.error("[Cron:Reminders] Fatal error:", error);
    return cronResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}

/**
 * Get users who have email reminders enabled
 */
async function getUsersWithRemindersEnabled(): Promise<
  Array<{
    userId: string;
    email: string;
    displayName: string;
    preferredLocale?: "en" | "he";
  }>
> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
      [
        Query.equal("emailReminders", true),
        Query.limit(1000),
      ]
    );

    return response.documents.map((doc) => ({
      userId: doc.userId as string,
      email: doc.email as string,
      displayName: doc.displayName as string,
      preferredLocale: (doc.preferredLocale as "en" | "he") || "en",
    }));
  } catch (error) {
    console.error("[Cron:Reminders] Failed to fetch users:", error);
    return [];
  }
}

/**
 * Get daily set for a user
 */
async function getDailySetForUser(
  userId: string,
  date: string
): Promise<{
  totalProblems: number;
  focusTopicName: string;
  isCompleted: boolean;
} | null> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_DAILY_SETS_COLLECTION!,
      [
        Query.equal("userId", userId),
        Query.equal("date", date),
        Query.limit(1),
      ]
    );

    if (response.documents.length === 0) {
      return null;
    }

    const doc = response.documents[0];
    return {
      totalProblems: doc.totalProblems as number,
      focusTopicName: doc.focusTopicName as string,
      isCompleted: doc.isCompleted as boolean,
    };
  } catch (error) {
    console.error("[Cron:Reminders] Failed to fetch daily set:", error);
    return null;
  }
}
