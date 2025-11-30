// app/api/cron/streak-warnings/route.ts
// Cron job to send streak warning emails at 6 PM (Israel time)

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { sendStreakWarning } from "@/modules/notifications/server/services/email.service";
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
    console.error("[Cron:StreakWarnings] Unauthorized request");
    return unauthorizedResponse();
  }

  const startTime = Date.now();
  console.log("[Cron:StreakWarnings] Starting streak warning emails...");

  try {
    const today = getIsraelDate();
    console.log(`[Cron:StreakWarnings] Processing for date: ${today}`);

    // Get users who have:
    // 1. Streak warnings enabled
    // 2. Current streak > 0
    // 3. Today's set NOT completed
    const usersAtRisk = await getUsersWithStreakAtRisk(today);
    console.log(`[Cron:StreakWarnings] Found ${usersAtRisk.length} users at risk`);

    if (usersAtRisk.length === 0) {
      return cronResponse({
        success: true,
        message: "No users at risk of losing streak",
        stats: { sent: 0, failed: 0, skipped: 0 },
      });
    }

    let sent = 0;
    let failed = 0;
    const skipped = 0;

    // Process users in batches
    const BATCH_SIZE = 10;

    for (let i = 0; i < usersAtRisk.length; i += BATCH_SIZE) {
      const batch = usersAtRisk.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Send streak warning email
            const success = await sendStreakWarning(
              {
                email: user.email,
                displayName: user.displayName,
                preferredLocale: user.preferredLocale,
              },
              user.currentStreak
            );

            if (success) {
              sent++;
            } else {
              failed++;
            }
          } catch (error) {
            console.error(`[Cron:StreakWarnings] Error for user ${user.userId}:`, error);
            failed++;
          }
        })
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron:StreakWarnings] Completed in ${duration}ms`);

    return cronResponse({
      success: true,
      message: `Sent ${sent} streak warning emails`,
      stats: { sent, failed, skipped },
      durationMs: duration,
    });
  } catch (error) {
    console.error("[Cron:StreakWarnings] Fatal error:", error);
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
 * Get users who are at risk of losing their streak
 */
async function getUsersWithStreakAtRisk(
  today: string
): Promise<
  Array<{
    userId: string;
    email: string;
    displayName: string;
    currentStreak: number;
    preferredLocale?: "en" | "he";
  }>
> {
  const { databases } = await createAdminClient();

  try {
    // Get users with streak warnings enabled and streak > 0
    const profilesResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
      [
        Query.equal("streakWarnings", true),
        Query.greaterThan("currentStreak", 0),
        Query.limit(1000),
      ]
    );

    // Filter to users who haven't completed today's set
    const usersAtRisk: Array<{
      userId: string;
      email: string;
      displayName: string;
      currentStreak: number;
      preferredLocale?: "en" | "he";
    }> = [];

    for (const profile of profilesResponse.documents) {
      // Check if user has completed today's set
      const setsResponse = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_DAILY_SETS_COLLECTION!,
        [
          Query.equal("userId", profile.userId as string),
          Query.equal("date", today),
          Query.limit(1),
        ]
      );

      // If no set exists or set is not completed, user is at risk
      const hasCompletedToday =
        setsResponse.documents.length > 0 &&
        setsResponse.documents[0].isCompleted === true;

      if (!hasCompletedToday) {
        usersAtRisk.push({
          userId: profile.userId as string,
          email: profile.email as string,
          displayName: profile.displayName as string,
          currentStreak: profile.currentStreak as number,
          preferredLocale: (profile.preferredLocale as "en" | "he") || "en",
        });
      }
    }

    return usersAtRisk;
  } catch (error) {
    console.error("[Cron:StreakWarnings] Failed to fetch users:", error);
    return [];
  }
}
