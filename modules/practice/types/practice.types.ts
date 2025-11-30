// modules/practice/types/practice.types.ts
// Type definitions for the Practice module

import type { Difficulty } from "@/modules/skill-tree/types";

/**
 * Problem slot types in a daily set
 */
export type ProblemSlot = "review" | "core" | "foundation" | "challenge";

/**
 * Answer submission type
 */
export type AnswerType = "text" | "image" | "skipped";

/**
 * Problem status
 */
export type ProblemStatus = "pending" | "answered" | "skipped";

/**
 * AI-generated problem structure
 */
export interface Problem {
  id: string;
  topicId: string;
  topicName: string;
  topicNameHe: string;
  slot: ProblemSlot;
  difficulty: Difficulty;

  // Question content
  questionText: string;
  questionTextHe: string;
  questionLatex?: string; // Optional LaTeX for math expressions

  // Solution (revealed after answering)
  correctAnswer: string;
  solutionSteps: string[];
  solutionStepsHe: string[];
  hint?: string;
  hintHe?: string;

  // Metadata
  estimatedMinutes: number;
  xpReward: number;
}

/**
 * User's attempt at a problem
 */
export interface ProblemAttempt {
  id: string;
  dailySetId: string;  // Can also store sessionId for topic practice
  problemId: string;
  userId: string;

  // Answer
  answerType: AnswerType;
  answerText?: string;
  answerImageUrl?: string;

  // Result
  isCorrect: boolean | null; // null if skipped or pending AI review

  // AI feedback (for image uploads)
  aiFeedback?: string;
  aiFeedbackHe?: string;

  // Timestamps
  startedAt: string;
  submittedAt: string | null;
}

/**
 * Daily set of problems
 */
export interface DailySet {
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)

  // Problems
  problems: Problem[];

  // Progress
  currentIndex: number;
  completedCount: number;
  totalProblems: number;

  // Status
  isCompleted: boolean;
  completedAt: string | null;

  // XP earned
  xpEarned: number;

  // Focus topic for the day
  focusTopicId: string;
  focusTopicName: string;
}

/**
 * Daily set with attempts (for UI)
 */
export interface DailySetWithAttempts extends DailySet {
  attempts: Map<string, ProblemAttempt>;
}

/**
 * Problem with attempt status (for UI)
 */
export interface ProblemWithStatus extends Problem {
  status: ProblemStatus;
  attempt: ProblemAttempt | null;
}

/**
 * Daily set generation config
 */
export interface DailySetConfig {
  totalProblems: number; // Default 5
  reviewDaysThreshold: number; // Days since last practice for review slot
  slots: {
    review: number; // 1
    core: number; // 2
    foundation: number; // 1
    challenge: number; // 1
  };
}

export const DEFAULT_DAILY_SET_CONFIG: DailySetConfig = {
  totalProblems: 5,
  reviewDaysThreshold: 3,
  slots: {
    review: 1,
    core: 2,
    foundation: 1,
    challenge: 1,
  },
};

/**
 * XP rewards per difficulty
 */
export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 20,
};

/**
 * Slot descriptions for UI
 */
export const SLOT_INFO: Record<ProblemSlot, { icon: string; color: string }> = {
  review: { icon: "tabler:refresh", color: "secondary" },
  core: { icon: "tabler:target", color: "primary" },
  foundation: { icon: "tabler:building-foundation", color: "success" },
  challenge: { icon: "tabler:flame", color: "warning" },
};
