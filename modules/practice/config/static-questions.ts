// modules/practice/config/static-questions.ts
// All questions come from database - no static data

import type { Problem } from "../types";

/**
 * Static questions array - kept empty as all questions come from database
 */
export const PRE_ALGEBRA_QUESTIONS: Problem[] = [];

/**
 * Get a daily set - returns empty structure
 * Actual daily sets are managed in the database
 */
export function getStaticDailySet(userId: string): {
  id: string;
  userId: string;
  date: string;
  problems: Problem[];
  currentIndex: number;
  completedCount: number;
  totalProblems: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpEarned: number;
  focusTopicId: string;
  focusTopicName: string;
} {
  const today = new Date().toISOString().split("T")[0];

  return {
    id: `daily-${userId}-${today}`,
    userId,
    date: today,
    problems: [],
    currentIndex: 0,
    completedCount: 0,
    totalProblems: 0,
    isCompleted: false,
    completedAt: null,
    xpEarned: 0,
    focusTopicId: "",
    focusTopicName: "",
  };
}

/**
 * Calculate total possible XP from questions
 */
export const TOTAL_POSSIBLE_XP = 0;
