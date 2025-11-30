// modules/ai/types/ai.types.ts
// AI-related type definitions

import type { Difficulty } from "@/modules/skill-tree/types";

/**
 * Generated question from AI
 */
export interface GeneratedQuestion {
  questionText: string;
  questionTextHe: string;
  correctAnswer: string;
  solutionSteps: string[];
  solutionStepsHe: string[];
  hint: string;
  hintHe: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
}

/**
 * Request for generating a question
 */
export interface QuestionGenerationRequest {
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
