// app/api/ai/test/route.ts
// Simple API endpoint to test AI Gateway connection

import { generateText, generateObject, gateway } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

// Gateway model format
const GATEWAY_MODEL_ID = "google/gemini-2.5-flash";
const FALLBACK_MODEL_ID = "anthropic/claude-sonnet-4";
const model = gateway(GATEWAY_MODEL_ID);

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{
      name: string;
      success: boolean;
      result?: unknown;
      error?: string;
      duration: number;
    }>,
  };

  // Test 1: Simple text generation via AI Gateway
  const test1Start = Date.now();
  try {
    const { text } = await generateText({
      model,
      prompt: "What is 2 + 2? Reply with just the number.",
      maxOutputTokens: 10,
      providerOptions: {
        gateway: {
          tags: ["api-test", "text-generation"],
          order: ["google", "anthropic"],
          models: [GATEWAY_MODEL_ID, FALLBACK_MODEL_ID],
        },
      },
    });

    results.tests.push({
      name: "Simple Text Generation (AI Gateway)",
      success: true,
      result: text.trim(),
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.tests.push({
      name: "Simple Text Generation (AI Gateway)",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - test1Start,
    });
  }

  // Test 2: Structured object generation via AI Gateway
  const test2Start = Date.now();
  try {
    const mathSchema = z.object({
      question: z.string(),
      answer: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    });

    const { object } = await generateObject({
      model,
      schema: mathSchema,
      prompt: "Generate a simple addition problem for a 1st grader.",
      temperature: 0.7,
      providerOptions: {
        gateway: {
          tags: ["api-test", "object-generation"],
          order: ["google", "anthropic"],
          models: [GATEWAY_MODEL_ID, FALLBACK_MODEL_ID],
        },
      },
    });

    results.tests.push({
      name: "Structured Object Generation (AI Gateway)",
      success: true,
      result: object,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.tests.push({
      name: "Structured Object Generation (AI Gateway)",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - test2Start,
    });
  }

  // Summary
  const allPassed = results.tests.every((t) => t.success);

  return NextResponse.json(
    {
      status: allPassed ? "success" : "partial_failure",
      message: allPassed
        ? "All AI Gateway tests passed!"
        : "Some tests failed. Check individual results.",
      model: `${GATEWAY_MODEL_ID} (via AI Gateway)`,
      failover: FALLBACK_MODEL_ID,
      ...results,
    },
    { status: allPassed ? 200 : 500 }
  );
}
