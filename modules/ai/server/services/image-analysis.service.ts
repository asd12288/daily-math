// modules/ai/server/services/image-analysis.service.ts
// AI-powered analysis of handwritten math solutions via Vercel AI Gateway

import { generateObject } from "ai";
import { z } from "zod/v4";
import {
  IMAGE_ANALYSIS_CONFIG,
  IMAGE_ANALYSIS_SYSTEM_PROMPT,
  getImageAnalysisPrompt,
  createGatewayOptions,
} from "../../config";
import type { ImageAnalysisRequest, ImageAnalysisResponse } from "../../types";

/**
 * Helper to convert base64 data URL to buffer or use URL directly
 */
function prepareImageContent(imageInput: string): { type: "image"; image: string | Buffer } {
  // Check if it's a base64 data URL
  if (imageInput.startsWith("data:")) {
    // Extract the base64 data after the comma
    const base64Data = imageInput.split(",")[1];
    if (base64Data) {
      return {
        type: "image",
        image: Buffer.from(base64Data, "base64"),
      };
    }
  }

  // Otherwise treat as URL
  return {
    type: "image",
    image: imageInput,
  };
}

/**
 * Zod schema for image analysis response
 */
const imageAnalysisSchema = z.object({
  extractedAnswer: z
    .string()
    .nullable()
    .describe("The final answer extracted from the handwriting, or null if unclear"),
  workShown: z
    .boolean()
    .describe("Whether the student showed their work/steps"),
  isCorrect: z
    .boolean()
    .nullable()
    .describe("Whether the answer is correct, null if cannot determine"),
  feedback: z
    .string()
    .describe("Constructive feedback on their solution approach"),
  stepsIdentified: z
    .array(z.string())
    .describe("List of solution steps identified in their work"),
  errors: z
    .array(z.string())
    .describe("Specific errors or misconceptions noticed"),
  suggestions: z
    .array(z.string())
    .describe("Suggestions for improvement"),
});

/**
 * Hebrew translation schema for feedback
 */
const hebrewFeedbackSchema = z.object({
  feedbackHe: z.string(),
  errorsHe: z.array(z.string()),
  suggestionsHe: z.array(z.string()),
});

/**
 * Analyze an image of handwritten math work
 * Supports both URL and base64 data URL formats
 */
export async function analyzeHandwrittenSolution(
  request: ImageAnalysisRequest & { userId?: string }
): Promise<ImageAnalysisResponse> {
  const { imageUrl, questionText, correctAnswer, locale = "en", userId } = request;

  const prompt = getImageAnalysisPrompt(questionText, correctAnswer);
  const imageContent = prepareImageContent(imageUrl);

  // Gateway options with analytics and failover (critical for answer verification)
  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["image-analysis", locale],
    enableFailover: true,
  });

  try {
    const { object: analysis } = await generateObject({
      model: IMAGE_ANALYSIS_CONFIG.model,
      system: IMAGE_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            imageContent,
          ],
        },
      ],
      schema: imageAnalysisSchema,
      temperature: IMAGE_ANALYSIS_CONFIG.temperature,
      providerOptions: gatewayOptions,
    });

    // If Hebrew is requested, translate feedback
    if (locale === "he" && analysis.feedback) {
      try {
        const translationGatewayOptions = createGatewayOptions({
          userId,
          tags: ["image-analysis", "translation", "hebrew"],
          enableFailover: true,
        });

        const { object: hebrewContent } = await generateObject({
          model: IMAGE_ANALYSIS_CONFIG.model,
          prompt: `Translate this math feedback to Hebrew:
Feedback: ${analysis.feedback}
Errors: ${analysis.errors.join(", ")}
Suggestions: ${analysis.suggestions.join(", ")}`,
          schema: hebrewFeedbackSchema,
          temperature: 0.3,
          providerOptions: translationGatewayOptions,
        });

        return {
          ...analysis,
          feedback: hebrewContent.feedbackHe,
          errors: hebrewContent.errorsHe,
          suggestions: hebrewContent.suggestionsHe,
        };
      } catch {
        // If translation fails, return English version
        return analysis;
      }
    }

    return analysis;
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw new Error("Failed to analyze image. Please try again with a clearer photo.");
  }
}

/**
 * Quick check if an image is readable enough for analysis
 * Supports both URL and base64 data URL formats
 */
export async function validateImageReadability(
  imageInput: string,
  userId?: string
): Promise<{
  isReadable: boolean;
  quality: "good" | "acceptable" | "poor";
  suggestion?: string;
}> {
  const readabilitySchema = z.object({
    isReadable: z.boolean(),
    quality: z.enum(["good", "acceptable", "poor"]),
    suggestion: z.string().optional(),
  });

  const imageContent = prepareImageContent(imageInput);

  // Gateway options for validation
  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["image-validation"],
    enableFailover: true,
  });

  try {
    const { object: result } = await generateObject({
      model: IMAGE_ANALYSIS_CONFIG.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Evaluate if this image of handwritten math work is clear enough to analyze. Is the writing readable? Is the image in focus? Is there enough contrast?",
            },
            imageContent,
          ],
        },
      ],
      schema: readabilitySchema,
      temperature: 0.2,
      providerOptions: gatewayOptions,
    });

    return result;
  } catch (error) {
    console.error("Image validation failed:", error);
    return {
      isReadable: false,
      quality: "poor",
      suggestion: "Unable to process image. Please try uploading a different photo.",
    };
  }
}

/**
 * Compare extracted answer with correct answer
 * Handles various formats (fractions, decimals, expressions)
 */
export function compareAnswers(
  extractedAnswer: string | null,
  correctAnswer: string
): boolean | null {
  if (!extractedAnswer) return null;

  // Normalize both answers
  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "") // Remove whitespace
      .replace(/\*/g, "·") // Normalize multiplication
      .replace(/\^/g, "") // Remove caret for exponents
      .trim();
  };

  const normalizedExtracted = normalize(extractedAnswer);
  const normalizedCorrect = normalize(correctAnswer);

  // Direct match
  if (normalizedExtracted === normalizedCorrect) {
    return true;
  }

  // Try numeric comparison
  try {
    const extractedNum = parseFloat(extractedAnswer);
    const correctNum = parseFloat(correctAnswer);

    if (!isNaN(extractedNum) && !isNaN(correctNum)) {
      // Allow small floating point differences
      return Math.abs(extractedNum - correctNum) < 0.0001;
    }
  } catch {
    // Not numeric, continue with string comparison
  }

  // Check for equivalent fractions (simple cases)
  const fractionRegex = /^(-?\d+)\/(\d+)$/;
  const extractedFrac = extractedAnswer.match(fractionRegex);
  const correctFrac = correctAnswer.match(fractionRegex);

  if (extractedFrac && correctFrac) {
    const extractedValue =
      parseInt(extractedFrac[1]) / parseInt(extractedFrac[2]);
    const correctValue = parseInt(correctFrac[1]) / parseInt(correctFrac[2]);
    return Math.abs(extractedValue - correctValue) < 0.0001;
  }

  return false;
}

/**
 * Generate feedback based on analysis results
 */
export function generateDetailedFeedback(
  analysis: ImageAnalysisResponse
): string {
  const parts: string[] = [];

  if (analysis.isCorrect === true) {
    parts.push("Great job! Your answer is correct.");
  } else if (analysis.isCorrect === false) {
    parts.push("Your answer isn't quite right, but keep trying!");
  } else {
    parts.push("I couldn't clearly determine your final answer.");
  }

  if (analysis.workShown) {
    parts.push("Good work showing your steps!");
  } else {
    parts.push("Try to show your work - it helps catch errors.");
  }

  if (analysis.errors.length > 0) {
    parts.push(`Watch out for: ${analysis.errors[0]}`);
  }

  if (analysis.suggestions.length > 0) {
    parts.push(`Tip: ${analysis.suggestions[0]}`);
  }

  return parts.join(" ");
}
