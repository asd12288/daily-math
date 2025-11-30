// modules/ai/server/services/socratic-tutor.service.ts
// Socratic tutoring via Vercel AI Gateway - provides hints without giving answers

import { generateObject } from "ai";
import { z } from "zod/v4";
import {
  SOCRATIC_TUTOR_CONFIG,
  SOCRATIC_TUTOR_SYSTEM_PROMPT,
  getSocraticHintPrompt,
  createGatewayOptions,
} from "../../config";
import type { HintRequest, HintResponse } from "../../types";

/**
 * Zod schema for hint response
 */
const hintResponseSchema = z.object({
  hint: z.string().describe("A Socratic hint that guides without revealing the answer"),
  hintType: z
    .enum(["conceptual", "procedural", "encouragement", "direction"])
    .describe("The type of hint being provided"),
  relatedConcept: z
    .string()
    .optional()
    .describe("A related concept the student should review"),
});

/**
 * Hebrew translation schema for hints
 */
const hintHebrewSchema = z.object({
  hintHe: z.string().describe("The hint translated to Hebrew"),
});

/**
 * Generate a Socratic hint for a student
 * The hint guides them toward the solution without giving the answer
 */
export async function generateHint(
  request: HintRequest & { userId?: string }
): Promise<HintResponse> {
  const {
    questionText,
    correctAnswer,
    userAttempt,
    previousHints,
    locale = "en",
    userId,
  } = request;

  const prompt = getSocraticHintPrompt(
    questionText,
    correctAnswer,
    userAttempt,
    previousHints
  );

  const hintNumber = (previousHints?.length || 0) + 1;

  // Gateway options with analytics and failover
  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["hint", `hint-${hintNumber}`],
    enableFailover: true,
  });

  try {
    const { object: hintResult } = await generateObject({
      model: SOCRATIC_TUTOR_CONFIG.model,
      system: SOCRATIC_TUTOR_SYSTEM_PROMPT,
      prompt,
      schema: hintResponseSchema,
      temperature: SOCRATIC_TUTOR_CONFIG.temperature,
      providerOptions: gatewayOptions,
    });

    // If Hebrew is requested, translate the hint
    if (locale === "he") {
      const translationGatewayOptions = createGatewayOptions({
        userId,
        tags: ["hint", "translation", "hebrew"],
        enableFailover: true,
      });

      const { object: hebrewHint } = await generateObject({
        model: SOCRATIC_TUTOR_CONFIG.model,
        prompt: `Translate this math tutoring hint to Hebrew. Keep it warm and encouraging:
"${hintResult.hint}"`,
        schema: hintHebrewSchema,
        temperature: 0.3,
        providerOptions: translationGatewayOptions,
      });

      return {
        hint: hebrewHint.hintHe,
        hintType: hintResult.hintType,
        relatedConcept: hintResult.relatedConcept,
      };
    }

    return hintResult;
  } catch (error) {
    console.error("Hint generation failed:", error);
    throw new Error("Failed to generate hint. Please try again.");
  }
}

/**
 * Generate a progressive hint based on how many hints already given
 */
export async function generateProgressiveHint(
  request: HintRequest & { userId?: string }
): Promise<HintResponse> {
  const hintCount = request.previousHints?.length || 0;

  // Adjust the approach based on how many hints already given
  let additionalContext = "";

  if (hintCount === 0) {
    additionalContext =
      "This is the first hint. Be very gentle - just point them in the right direction.";
  } else if (hintCount === 1) {
    additionalContext =
      "This is the second hint. Be a bit more specific about what concept or step to focus on.";
  } else if (hintCount === 2) {
    additionalContext =
      "This is the third hint. Help them identify where they might be going wrong.";
  } else {
    additionalContext =
      "The student has asked for multiple hints. Be more direct but still don't give the answer.";
  }

  const modifiedRequest: HintRequest & { userId?: string } = {
    ...request,
    questionText: `${request.questionText}\n\n[CONTEXT: ${additionalContext}]`,
  };

  return generateHint(modifiedRequest);
}

/**
 * Generate an encouraging message when student is stuck
 */
export async function generateEncouragement(
  questionText: string,
  locale: "en" | "he" = "en"
): Promise<string> {
  const encouragements = {
    en: [
      "Math is like a puzzle - every piece you understand brings you closer to the solution!",
      "Taking time to think is part of learning. You're doing great!",
      "Even the best mathematicians get stuck sometimes. Keep going!",
      "Remember, every problem you solve makes you stronger at math.",
      "You've got this! Sometimes stepping back and looking at the basics helps.",
    ],
    he: [
      "מתמטיקה היא כמו פאזל - כל חלק שאתה מבין מקרב אותך לפתרון!",
      "לקחת זמן לחשוב זה חלק מהלמידה. אתה עושה עבודה מצוינת!",
      "גם המתמטיקאים הטובים ביותר נתקעים לפעמים. המשך!",
      "זכור, כל בעיה שתפתור הופכת אותך לחזק יותר במתמטיקה.",
      "אתה יכול! לפעמים לחזור ולהסתכל על היסודות עוזר.",
    ],
  };

  const messages = encouragements[locale];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Check if user attempt shows understanding (even if not fully correct)
 */
export async function analyzeAttempt(
  questionText: string,
  correctAnswer: string,
  userAttempt: string,
  userId?: string
): Promise<{
  showsUnderstanding: boolean;
  partialCredit: number; // 0-1 scale
  feedback: string;
}> {
  const analysisSchema = z.object({
    showsUnderstanding: z
      .boolean()
      .describe("Does the attempt show some understanding of the concept?"),
    partialCredit: z
      .number()
      .min(0)
      .max(1)
      .describe("Score from 0-1 for partial credit"),
    feedback: z
      .string()
      .describe("Brief, encouraging feedback on their attempt"),
  });

  // Gateway options for attempt analysis
  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["attempt-analysis"],
    enableFailover: true,
  });

  try {
    const { object: analysis } = await generateObject({
      model: SOCRATIC_TUTOR_CONFIG.model,
      system:
        "You are evaluating a student's math attempt. Be encouraging but honest. Focus on what they got RIGHT, not just wrong.",
      prompt: `Question: ${questionText}
Correct Answer: ${correctAnswer}
Student's Attempt: ${userAttempt}

Evaluate their attempt. Did they show understanding? How much partial credit (0-1)?`,
      schema: analysisSchema,
      temperature: 0.3,
      providerOptions: gatewayOptions,
    });

    return analysis;
  } catch (error) {
    console.error("Attempt analysis failed:", error);
    return {
      showsUnderstanding: false,
      partialCredit: 0,
      feedback: "Keep trying! Don't give up.",
    };
  }
}
