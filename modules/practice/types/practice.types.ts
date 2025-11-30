// modules/practice/types/practice.types.ts
// Type definitions for the Practice module
//
// NOTE: These types are for UI display, not direct DB storage.
// The Problem interface combines data from both `exercises` and `exercise_solutions` tables.
// Field names here may differ from DB field names for UI clarity.

import type { Difficulty } from "@/modules/skill-tree/types";
import type { AnswerType as ExerciseAnswerType } from "@/lib/appwrite/types";

/**
 * Problem slot types in a daily set
 */
export type ProblemSlot = "review" | "core" | "foundation" | "challenge";

/**
 * How the user submitted their answer
 * Note: Different from ExerciseAnswerType which is what TYPE of answer is expected
 */
export type UserAnswerMethod = "text" | "image" | "skipped";

/**
 * Problem status
 */
export type ProblemStatus = "pending" | "answered" | "skipped";

/**
 * Problem structure for UI display
 * Combines data from `exercises` and `exercise_solutions` tables
 *
 * Field mapping from DB:
 * - questionText ← exercises.question
 * - questionTextHe ← exercises.questionHe
 * - correctAnswer ← exercises.answer
 * - answerType ← exercises.answerType
 * - hint ← exercises.tip
 * - hintHe ← exercises.tipHe
 * - solutionSteps ← exercise_solutions.steps (parsed from JSON)
 * - solutionStepsHe ← exercise_solutions.stepsHe (parsed from JSON)
 */
export interface Problem {
  id: string;
  topicId: string;
  topicName: string;
  topicNameHe: string;
  slot: ProblemSlot;
  difficulty: Difficulty;

  // Question content (from exercises table)
  questionText: string; // DB: question
  questionTextHe: string; // DB: questionHe
  questionLatex?: string; // Optional extracted LaTeX for display

  // Answer info (from exercises table)
  correctAnswer: string; // DB: answer
  answerType: ExerciseAnswerType; // DB: answerType - numeric, expression, proof, open

  // Solution (from exercise_solutions table, revealed after answering)
  solutionSteps: string[]; // DB: steps (parsed from JSON)
  solutionStepsHe: string[]; // DB: stepsHe (parsed from JSON)

  // Hint (from exercises table)
  hint?: string; // DB: tip
  hintHe?: string; // DB: tipHe

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
  answerMethod: UserAnswerMethod; // How user submitted: text, image, or skipped
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

/**
 * Stuck detection info
 * Returned when user gets 5+ consecutive wrong answers on a topic
 */
export interface StuckInfo {
  isStuck: boolean;
  consecutiveWrong: number;
  suggestions: string[];
  suggestionsHe: string[];
  recommendedAction: "continue" | "review_hint" | "try_easier" | "take_break";
}

/**
 * Threshold for stuck detection
 */
export const STUCK_THRESHOLD = 5;

/**
 * @deprecated Use UserAnswerMethod instead
 * Kept for backward compatibility
 */
export type AnswerType = UserAnswerMethod;

/**
 * Helper to convert DB Exercise + ExerciseSolution to Problem for UI
 */
export interface ExerciseWithSolution {
  // From exercises table
  $id: string;
  topicId: string;
  question: string;
  questionHe?: string;
  difficulty: "easy" | "medium" | "hard";
  answer?: string;
  answerType: "numeric" | "expression" | "proof" | "open";
  tip?: string;
  tipHe?: string;
  estimatedMinutes: number;
  xpReward: number;
  // From exercise_solutions table (already parsed)
  solutionSteps?: string[];
  solutionStepsHe?: string[];
  // Topic info (joined from topics)
  topicName?: string;
  topicNameHe?: string;
}

/**
 * Convert DB exercise data to Problem for UI display
 */
export function toProblem(
  exercise: ExerciseWithSolution,
  slot: ProblemSlot = "core"
): Problem {
  return {
    id: exercise.$id,
    topicId: exercise.topicId,
    topicName: exercise.topicName || "",
    topicNameHe: exercise.topicNameHe || "",
    slot,
    difficulty: exercise.difficulty,
    questionText: exercise.question,
    questionTextHe: exercise.questionHe || exercise.question,
    correctAnswer: exercise.answer || "",
    answerType: exercise.answerType,
    solutionSteps: exercise.solutionSteps || [],
    solutionStepsHe: exercise.solutionStepsHe || [],
    hint: exercise.tip,
    hintHe: exercise.tipHe,
    estimatedMinutes: exercise.estimatedMinutes,
    xpReward: exercise.xpReward,
  };
}
