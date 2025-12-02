// app/api/process-homework/route.ts
// Fire-and-forget processing endpoint for homework PDFs
// This route handles long-running AI processing and calls back when complete

import { NextRequest, NextResponse } from "next/server";
import { PdfProcessingService } from "@/modules/homework/server/services/pdf-processing.service";

// Vercel Function config - maximize timeout
// 60s on Pro plan, 10s on Hobby plan
export const maxDuration = 60;

/**
 * Get the base URL for callbacks
 * Uses NGROK_URL for local development, NEXT_PUBLIC_APP_URL for production
 */
function getBaseUrl(): string {
  return (
    process.env.NGROK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * POST /api/process-homework
 * Triggered by the upload procedure via fire-and-forget fetch
 * Processes the PDF and calls back to webhook when done
 */
export async function POST(request: NextRequest) {
  // Verify internal call with secret
  const secret = request.headers.get("x-internal-secret");

  console.log("[ProcessHomework] Auth check:", {
    receivedSecretPreview: secret?.substring(0, 10) + "...",
    expectedSecretPreview: process.env.INTERNAL_API_SECRET?.substring(0, 10) + "...",
    match: secret === process.env.INTERNAL_API_SECRET,
  });

  if (secret !== process.env.INTERNAL_API_SECRET) {
    console.warn("[ProcessHomework] Unauthorized request - invalid secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { homeworkId, userId, generateIllustrations } = await request.json();

  if (!homeworkId || !userId) {
    return NextResponse.json(
      { error: "Missing required fields: homeworkId, userId" },
      { status: 400 }
    );
  }

  console.log(`[ProcessHomework] Starting processing for homework ${homeworkId}`);

  try {
    // Full processing pipeline (extracts questions, solves, generates illustrations)
    const result = await PdfProcessingService.processHomework(
      homeworkId,
      userId,
      generateIllustrations
    );

    console.log(
      `[ProcessHomework] Completed homework ${homeworkId}: ${
        result.success ? "success" : "failed"
      }`
    );

    // Callback to webhook to update status
    const webhookUrl = `${getBaseUrl()}/api/webhooks/homework-complete`;
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          homeworkId,
          status: result.success ? "completed" : "failed",
          questionCount: result.questionCount,
          error: result.error,
        }),
      });
    } catch (webhookError) {
      console.error(
        `[ProcessHomework] Failed to send webhook for ${homeworkId}:`,
        webhookError
      );
      // Processing succeeded but webhook failed - status might be stale
    }

    return NextResponse.json({
      success: result.success,
      questionCount: result.questionCount,
    });
  } catch (error) {
    console.error(`[ProcessHomework] Error processing ${homeworkId}:`, error);

    // Report failure via webhook
    const webhookUrl = `${getBaseUrl()}/api/webhooks/homework-complete`;
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          homeworkId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    } catch (webhookError) {
      console.error(
        `[ProcessHomework] Failed to send failure webhook for ${homeworkId}:`,
        webhookError
      );
    }

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
