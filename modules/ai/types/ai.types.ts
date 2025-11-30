// modules/ai/types/ai.types.ts
// AI-related type definitions

import type { Difficulty } from "@/modules/skill-tree/types";
import type { AnswerType } from "@/lib/appwrite/types";

/**
 * Answer type for exercises
 */
export type { AnswerType } from "@/lib/appwrite/types";

/**
 * Generated question from AI - raw output before DB storage
 */
export interface GeneratedQuestion {
  // Question content (use "question" to match DB, but AI generates as questionText)
  questionText: string;
  questionTextHe: string;

  // Answer
  correctAnswer: string;
  answerType: AnswerType; // numeric, expression, proof, open

  // Solution steps (will be stored in exercise_solutions table)
  solutionSteps: string[];
  solutionStepsHe: string[];

  // Hint/tip
  hint: string;
  hintHe: string;

  // Metadata
  difficulty: Difficulty;
  estimatedMinutes: number;
  xpReward: number; // 10 for easy, 15 for medium, 20 for hard
}

/**
 * Data ready to be stored in exercises collection
 * Maps GeneratedQuestion fields to DB field names
 */
export interface ExerciseCreateData {
  courseId: string;
  topicId: string;
  question: string;
  questionHe: string;
  difficulty: Difficulty;
  xpReward: number;
  answer: string;
  answerType: AnswerType;
  tip: string;
  tipHe: string;
  estimatedMinutes: number;
  isActive: boolean;
  generatedBy: string;
  generatedAt: string;
  timesUsed: number;
}

/**
 * Data ready to be stored in exercise_solutions collection
 */
export interface ExerciseSolutionCreateData {
  exerciseId: string;
  solution: string;
  steps: string; // JSON stringified array
  stepsHe: string; // JSON stringified array
}

/**
 * Request for generating a question
 */
export interface QuestionGenerationRequest {
  courseId?: string; // Optional - only needed for DB storage
  topicId: string;
  difficulty: Difficulty;
  questionType?: string;
  excludeQuestions?: string[]; // Question IDs to avoid similar questions
  locale?: "en" | "he";
}

/**
 * Socratic hint request
 */
export interface HintRequest {
  questionText: string;
  correctAnswer: string;
  userAttempt?: string;
  previousHints?: string[];
  locale?: "en" | "he";
}

/**
 * Socratic hint response - guides without giving answer
 */
export interface HintResponse {
  hint: string;
  hintType: "conceptual" | "procedural" | "encouragement" | "direction";
  relatedConcept?: string;
}

/**
 * Image analysis request for handwritten work
 */
export interface ImageAnalysisRequest {
  imageUrl: string;
  questionText: string;
  correctAnswer: string;
  locale?: "en" | "he";
}

/**
 * Image analysis response
 */
export interface ImageAnalysisResponse {
  extractedAnswer: string | null;
  workShown: boolean;
  isCorrect: boolean | null; // null if can't determine
  feedback: string;
  stepsIdentified: string[];
  errors: string[];
  suggestions: string[];
}

/**
 * AI model configuration
 * Note: model is a LanguageModel from AI SDK, not a string
 */
export interface AIModelConfig {
  model: ReturnType<typeof import("ai").gateway>;
  temperature: number;
  maxTokens: number;
}

/**
 * Question generation context - topic info passed to AI
 */
export interface TopicContext {
  topicId: string;
  topicName: string;
  topicNameHe: string;
  description: string;
  descriptionHe: string;
  keywords: string[];
  questionTypes: string[];
}
