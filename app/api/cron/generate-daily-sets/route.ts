// app/api/cron/generate-daily-sets/route.ts
// Cron job to generate daily sets for all active users at midnight (Israel time)

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { DailySetService } from "@/modules/practice/server/services/daily-set.service";
import {
  verifyCronSecret,
  unauthorizedResponse,
  cronResponse,
  getNextIsraelDate,
} from "@/lib/cron-auth";

// Maximum execution time for cron (Vercel Pro: 5 min, Hobby: 1 min)
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    console.error("[Cron:DailySets] Unauthorized request");
    return unauthorizedResponse();
  }

  const startTime = Date.now();
  console.log("[Cron:DailySets] Starting daily set generation...");

  try {
    // Get the date for which we're generating sets
    // At 22:00 UTC, it's midnight in Israel, so we generate for "tomorrow" UTC
    const targetDate = getNextIsraelDate();
    console.log(`[Cron:DailySets] Generating sets for date: ${targetDate}`);

    // Get all active users
    const users = await getAllActiveUsers();
    console.log(`[Cron:DailySets] Found ${users.length} active users`);

    if (users.length === 0) {
      return cronResponse({
        success: true,
        message: "No active users found",
        date: targetDate,
        stats: { created: 0, failed: 0, skipped: 0, total: 0 },
      });
    }

    // Process users in batches to avoid timeouts
    const BATCH_SIZE = 5;
    let created = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`[Cron:DailySets] Processing batch ${batchNum}/${Math.ceil(users.length / BATCH_SIZE)}`);

      const batchResults = await Promise.allSettled(
        batch.map(async (user) => {
          const userId = user.$id || user.userId;

          // Skip if no valid userId
          if (!userId) {
            console.warn(`[Cron:DailySets] Skipping user with no ID`);
            return { status: "skipped", userId: "unknown" };
          }

          // Check if set already exists for this date
          const existing = await DailySetService.getDailySetByDate(userId, targetDate);
          if (existing) {
            console.log(`[Cron:DailySets] Set already exists for user ${userId}`);
            return { status: "skipped", userId };
          }

          // Generate new daily set with AI
          console.log(`[Cron:DailySets] Generating set for user ${userId}`);
          await DailySetService.generateDailySet(userId, targetDate);
          return { status: "created", userId };
        })
      );

      // Count results
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          if (result.value.status === "created") created++;
          else if (result.value.status === "skipped") skipped++;
        } else {
          failed++;
          console.error("[Cron:DailySets] Failed:", result.reason);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron:DailySets] Completed in ${duration}ms`);

    return cronResponse({
      success: true,
      message: `Generated daily sets for ${created} users`,
      date: targetDate,
      stats: { created, failed, skipped, total: users.length },
      durationMs: duration,
    });
  } catch (error) {
    console.error("[Cron:DailySets] Fatal error:", error);
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
 * Get all active users from the database
 */
async function getAllActiveUsers(): Promise<Array<{ $id?: string; userId?: string }>> {
  const { databases } = await createAdminClient();

  try {
    // Query users_profile collection
    // Active users = those who haven't deactivated their account
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
      [
        Query.limit(1000), // Adjust based on expected user count
      ]
    );

    return response.documents.map((doc) => ({
      $id: doc.$id,
      userId: doc.userId as string,
      email: doc.email as string,
    }));
  } catch (error) {
    console.error("[Cron:DailySets] Failed to fetch users:", error);
    return [];
  }
}
