// modules/onboarding/types/onboarding.types.ts
// Types for the onboarding and diagnostic flow

import type { Difficulty } from "@/modules/skill-tree/types";

/**
 * Onboarding steps
 */
export type OnboardingStep =
  | "welcome"
  | "experience"
  | "diagnostic"
  | "results"
  | "complete";

/**
 * User's self-reported experience level
 */
export type ExperienceLevel = "beginner" | "some" | "comfortable" | "advanced";

/**
 * Diagnostic question for placement test
 */
export interface DiagnosticQuestion {
  id: string;
  topicId: string;
  topicName: string;
  topicNameHe: string;
  branchId: string;
  difficulty: Difficulty;
  questionText: string;
  questionTextHe: string;
  correctAnswer: string;
  hint?: string;
  hintHe?: string;
}

/**
 * User's answer to a diagnostic question
 */
export interface DiagnosticAnswer {
  questionId: string;
  topicId: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  skipped: boolean;
  timeSpentSeconds: number;
}

/**
 * Result of the diagnostic test
 */
export interface DiagnosticResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  skippedCount: number;
  percentCorrect: number;
  topicResults: TopicDiagnosticResult[];
  recommendedStartTopic: string;
  estimatedLevel: ExperienceLevel;
}

/**
 * Per-topic diagnostic result
 */
export interface TopicDiagnosticResult {
  topicId: string;
  topicName: string;
  branchId: string;
  questionsAsked: number;
  correctAnswers: number;
  status: "mastered" | "needs_practice" | "not_tested";
}

/**
 * Onboarding state stored in database
 */
export interface OnboardingState {
  userId: string;
  isCompleted: boolean;
  completedAt: string | null;
  currentStep: OnboardingStep;
  experienceLevel: ExperienceLevel | null;
  diagnosticAnswers: DiagnosticAnswer[];
  diagnosticResult: DiagnosticResult | null;
  startedAt: string;
}

/**
 * Onboarding preferences collected during flow
 */
export interface OnboardingPreferences {
  experienceLevel: ExperienceLevel;
  preferredLanguage: "en" | "he";
  dailyGoal: number; // 1-10 problems per day
  reminderTime: string | null; // HH:MM format
}

/**
 * Configuration for diagnostic test
 */
export interface DiagnosticConfig {
  questionsPerBranch: number;
  maxQuestions: number;
  timeoutSeconds: number;
  adaptiveDifficulty: boolean;
}

/**
 * Default diagnostic configuration
 */
export const DEFAULT_DIAGNOSTIC_CONFIG: DiagnosticConfig = {
  questionsPerBranch: 2,
  maxQuestions: 10,
  timeoutSeconds: 180, // 3 minutes per question max
  adaptiveDifficulty: true,
};
