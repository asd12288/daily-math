// app/api/webhooks/homework-complete/route.ts
// Webhook callback endpoint for homework processing completion
// Called by /api/process-homework when processing finishes

import { NextRequest, NextResponse } from "next/server";
import { HomeworkService } from "@/modules/homework/server/services/homework.service";

/**
 * POST /api/webhooks/homework-complete
 * Receives completion callbacks from the processing API
 * Updates homework status in the database
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");

  console.log("[Webhook] Received homework-complete callback:", {
    hasSecret: !!secret,
    secretPreview: secret?.substring(0, 10) + "...",
    expectedPreview: process.env.WEBHOOK_SECRET?.substring(0, 10) + "...",
    match: secret === process.env.WEBHOOK_SECRET,
  });

  if (secret !== process.env.WEBHOOK_SECRET) {
    console.warn("[Webhook] Invalid webhook secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { homeworkId, status, questionCount, error } = await request.json();

    if (!homeworkId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: homeworkId, status" },
        { status: 400 }
      );
    }

    console.log(
      `[Webhook] Homework ${homeworkId} processing completed: ${status}`
    );

    // Update homework status in database
    await HomeworkService.updateHomeworkStatus(homeworkId, status, {
      questionCount,
      errorMessage: error,
      processingCompletedAt: new Date().toISOString(),
    });

    // Future: Could trigger push notification, email, etc.
    // e.g., await NotificationService.sendProcessingComplete(homeworkId);

    return NextResponse.json({
      success: true,
      message: `Homework ${homeworkId} status updated to ${status}`,
    });
  } catch (error) {
    console.error("[Webhook] Error processing callback:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
