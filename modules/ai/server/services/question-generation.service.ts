// modules/ai/server/services/question-generation.service.ts
// AI-powered question generation using Vercel AI Gateway

import { generateObject } from "ai";
import { z } from "zod/v4";
import { getTopicById } from "@/modules/skill-tree/config/topics";
import {
  QUESTION_GENERATION_CONFIG,
  QUESTION_GENERATION_SYSTEM_PROMPT,
  getQuestionGenerationPrompt,
  createGatewayOptions,
} from "../../config";
import type {
  GeneratedQuestion,
  QuestionGenerationRequest,
  TopicContext,
  ExerciseCreateData,
  ExerciseSolutionCreateData,
} from "../../types";

/**
 * XP rewards by difficulty
 */
const XP_BY_DIFFICULTY = {
  easy: 10,
  medium: 15,
  hard: 20,
} as const;

/**
 * Zod schema for AI-generated question
 */
const generatedQuestionSchema = z.object({
  questionText: z.string().describe("The math problem in English"),
  correctAnswer: z
    .string()
    .describe("The exact correct answer (number, expression, or value)"),
  answerType: z
    .enum(["numeric", "expression", "proof", "open"])
    .describe(
      "Type of answer: 'numeric' for single numbers, 'expression' for algebraic expressions, 'proof' for proofs/derivations, 'open' for free-form answers"
    ),
  solutionSteps: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe("Step-by-step solution explanation"),
  hint: z
    .string()
    .describe("A helpful hint that guides without revealing the answer"),
  estimatedMinutes: z
    .number()
    .min(1)
    .max(10)
    .describe("Estimated time to solve in minutes"),
});

/**
 * Zod schema for Hebrew translation
 */
const hebrewTranslationSchema = z.object({
  questionTextHe: z.string().describe("Question text in Hebrew"),
  solutionStepsHe: z.array(z.string()).describe("Solution steps in Hebrew"),
  hintHe: z.string().describe("Hint in Hebrew"),
});

/**
 * Get topic context for AI prompt
 */
function getTopicContext(topicId: string): TopicContext | null {
  const topic = getTopicById(topicId);
  if (!topic) return null;

  return {
    topicId: topic.id,
    topicName: topic.name,
    topicNameHe: topic.nameHe,
    description: topic.description,
    descriptionHe: topic.descriptionHe,
    keywords: topic.keywords,
    questionTypes: topic.questionTypes,
  };
}

/**
 * Select a random question type for variety
 */
function selectQuestionType(
  questionTypes: string[],
  preferredType?: string
): string {
  if (preferredType && questionTypes.includes(preferredType)) {
    return preferredType;
  }
  return questionTypes[Math.floor(Math.random() * questionTypes.length)];
}

/**
 * Generate a math question using AI
 */
export async function generateQuestion(
  request: QuestionGenerationRequest & { userId?: string }
): Promise<GeneratedQuestion> {
  const { topicId, difficulty, questionType, userId } = request;

  // Get topic context
  const topicContext = getTopicContext(topicId);
  if (!topicContext) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  // Select question type
  const selectedType = selectQuestionType(
    topicContext.questionTypes,
    questionType
  );

  // Generate the question using AI
  const prompt = getQuestionGenerationPrompt(
    topicContext.topicName,
    topicContext.description,
    difficulty,
    selectedType,
    topicContext.keywords
  );

  // Gateway options for analytics and failover
  const gatewayOptions = createGatewayOptions({
    userId,
    tags: ["question-gen", topicId, difficulty],
    enableFailover: true,
  });

  try {
    // Generate English question first
    const { object: englishQuestion } = await generateObject({
      model: QUESTION_GENERATION_CONFIG.model,
      system: QUESTION_GENERATION_SYSTEM_PROMPT,
      prompt,
      schema: generatedQuestionSchema,
      temperature: QUESTION_GENERATION_CONFIG.temperature,
      providerOptions: gatewayOptions,
    });

    // Generate Hebrew translations
    const hebrewPrompt = `Translate these math problem components to Hebrew. Keep mathematical notation intact.

Question: ${englishQuestion.questionText}
Solution Steps: ${englishQuestion.solutionSteps.join(" | ")}
Hint: ${englishQuestion.hint}

Provide natural Hebrew translations suitable for Israeli university students.`;

    const translationGatewayOptions = createGatewayOptions({
      userId,
      tags: ["question-gen", "translation", "hebrew"],
      enableFailover: true,
    });

    const { object: hebrewContent } = await generateObject({
      model: QUESTION_GENERATION_CONFIG.model,
      prompt: hebrewPrompt,
      schema: hebrewTranslationSchema,
      temperature: 0.3, // Lower for translation accuracy
      providerOptions: translationGatewayOptions,
    });

    return {
      questionText: englishQuestion.questionText,
      questionTextHe: hebrewContent.questionTextHe,
      correctAnswer: englishQuestion.correctAnswer,
      answerType: englishQuestion.answerType,
      solutionSteps: englishQuestion.solutionSteps,
      solutionStepsHe: hebrewContent.solutionStepsHe,
      hint: englishQuestion.hint,
      hintHe: hebrewContent.hintHe,
      difficulty,
      estimatedMinutes: englishQuestion.estimatedMinutes,
      xpReward: XP_BY_DIFFICULTY[difficulty],
    };
  } catch (error) {
    console.error("Question generation failed:", error);
    throw new Error("Failed to generate question. Please try again.");
  }
}

/**
 * Generate multiple questions for a daily set
 */
export async function generateDailySetQuestions(
  requests: QuestionGenerationRequest[]
): Promise<GeneratedQuestion[]> {
  // Generate questions in parallel for speed
  const questionPromises = requests.map((req) => generateQuestion(req));

  try {
    const questions = await Promise.all(questionPromises);
    return questions;
  } catch (error) {
    console.error("Daily set generation failed:", error);
    throw new Error("Failed to generate daily set. Please try again.");
  }
}

/**
 * Generate a single question with retry logic
 */
export async function generateQuestionWithRetry(
  request: QuestionGenerationRequest & { userId?: string },
  maxRetries: number = 3
): Promise<GeneratedQuestion> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateQuestion(request);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Question generation attempt ${attempt} failed:`, error);

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Question generation failed after retries");
}

/**
 * Convert a generated question to exercise data for DB storage
 */
export function toExerciseCreateData(
  generated: GeneratedQuestion,
  courseId: string,
  topicId: string,
  modelName: string = "gemini-2.0-flash"
): ExerciseCreateData {
  return {
    courseId,
    topicId,
    question: generated.questionText,
    questionHe: generated.questionTextHe,
    difficulty: generated.difficulty,
    xpReward: generated.xpReward,
    answer: generated.correctAnswer,
    answerType: generated.answerType,
    tip: generated.hint,
    tipHe: generated.hintHe,
    estimatedMinutes: generated.estimatedMinutes,
    isActive: true,
    generatedBy: modelName,
    generatedAt: new Date().toISOString(),
    timesUsed: 0,
  };
}

/**
 * Convert a generated question to solution data for DB storage
 */
export function toSolutionCreateData(
  generated: GeneratedQuestion,
  exerciseId: string
): ExerciseSolutionCreateData {
  // Create a full solution text from the steps
  const solutionText = generated.solutionSteps.join("\n");

  return {
    exerciseId,
    solution: solutionText,
    steps: JSON.stringify(generated.solutionSteps),
    stepsHe: JSON.stringify(generated.solutionStepsHe),
  };
}
