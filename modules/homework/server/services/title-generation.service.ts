// modules/homework/server/services/title-generation.service.ts
// AI-powered title generation for homeworks with generic filenames

import { generateObject, createGateway } from "ai";
import { z } from "zod/v4";

/**
 * Vercel AI Gateway configuration
 */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const TITLE_MODEL = gateway("google/gemini-2.0-flash");

/**
 * Generic filename patterns that should trigger AI title generation
 */
const GENERIC_PATTERNS = [
  /^screenshot/i,
  /^img[_-]?\d*/i,
  /^image[_-]?\d*/i,
  /^scan/i,
  /^photo/i,
  /^dsc[_-]?\d*/i,
  /^pic[_-]?\d*/i,
  /^dcim/i,
  /^cam[_-]?\d*/i,
  /^whatsapp/i,
  /^\d{6,}/, // Just numbers (dates, timestamps)
  /^[a-z]{1,4}\d+$/i, // Short prefix + numbers
  /^untitled/i,
  /^document/i,
  /^file/i,
];

/**
 * Check if a filename looks generic and needs AI-generated title
 */
export function shouldGenerateTitle(title: string, fileName: string): boolean {
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, "").trim();

  // If title was explicitly provided by user and differs from filename, keep it
  if (title && title !== nameWithoutExt && !isGenericName(title)) {
    return false;
  }

  return isGenericName(nameWithoutExt);
}

/**
 * Check if a name looks generic
 */
function isGenericName(name: string): boolean {
  // Very short names (less than 5 chars) are likely generic
  if (name.length < 5) {
    return true;
  }

  // Check against generic patterns
  return GENERIC_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Schema for AI title generation
 */
const titleSchema = z.object({
  title: z
    .string()
    .min(5)
    .max(100)
    .describe("A concise, descriptive title for this homework based on its content"),
  language: z.enum(["en", "he"]).describe("The primary language of the questions"),
});

/**
 * Generate a descriptive title based on question content
 */
export async function generateHomeworkTitle(
  questions: Array<{ questionText: string; detectedSubject?: string; detectedTopic?: string }>
): Promise<{ title: string; language: string } | null> {
  if (!questions.length) {
    return null;
  }

  try {
    // Take first 3 questions for context (to keep prompt small)
    const sampleQuestions = questions.slice(0, 3);

    const questionTexts = sampleQuestions
      .map((q, i) => `${i + 1}. ${q.questionText.substring(0, 200)}`)
      .join("\n");

    const subjects = [...new Set(sampleQuestions.map((q) => q.detectedSubject).filter(Boolean))];
    const topics = [...new Set(sampleQuestions.map((q) => q.detectedTopic).filter(Boolean))];

    const prompt = `Generate a short, descriptive title for this homework assignment.

Questions (sample):
${questionTexts}

${subjects.length ? `Detected subjects: ${subjects.join(", ")}` : ""}
${topics.length ? `Detected topics: ${topics.join(", ")}` : ""}

Rules:
- Title should be 3-8 words
- Be specific about the math/physics topic
- If Hebrew content, generate Hebrew title
- Examples: "Calculus 1 - Derivative Rules", "Physics - Projectile Motion", "חדו״א - נגזרות"
- Do NOT include generic words like "homework", "assignment", "exercise sheet"`;

    const { object } = await generateObject({
      model: TITLE_MODEL,
      schema: titleSchema,
      prompt,
      temperature: 0.3,
    });

    console.log("[TitleGeneration] Generated title:", object.title);
    return object;
  } catch (error) {
    console.error("[TitleGeneration] Failed to generate title:", error);
    return null;
  }
}

export class TitleGenerationService {
  static shouldGenerateTitle = shouldGenerateTitle;
  static generateHomeworkTitle = generateHomeworkTitle;
}
