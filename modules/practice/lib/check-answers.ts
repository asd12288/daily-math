// modules/practice/lib/check-answers.ts
// Client-side answer validation utilities

import type { Problem } from "../types";

/**
 * Result for a single problem check
 */
export interface ProblemResult {
  problemId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  xpEarned: number;
}

/**
 * Results for an entire worksheet submission
 */
export interface WorksheetResults {
  results: ProblemResult[];
  totalXp: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalCount: number;
  percentage: number;
}

/**
 * Normalize an answer for comparison
 * Handles various equivalent forms
 */
export function normalizeAnswer(answer: string): string {
  if (!answer) return "";

  return answer
    .toLowerCase()
    .trim()
    // Remove spaces
    .replace(/\s+/g, "")
    // Remove "x=" prefix (accept both "4" and "x=4")
    .replace(/^x=/i, "")
    // Remove dollar signs (LaTeX markers)
    .replace(/\$/g, "")
    // Normalize fractions: convert "1 1/4" to "5/4"
    .replace(/(\d+)\s*(\d+)\/(\d+)/g, (_, whole, num, den) => {
      const w = parseInt(whole);
      const n = parseInt(num);
      const d = parseInt(den);
      return `${w * d + n}/${d}`;
    });
}

/**
 * Check if a fraction answer is equivalent
 * e.g., "5/4" equals "1.25" equals "1 1/4"
 */
function fractionEquals(userAnswer: string, correctAnswer: string): boolean {
  // Try to convert both to decimal and compare
  const toDecimal = (s: string): number | null => {
    // Handle "a/b" format
    const fractionMatch = s.match(/^(-?\d+)\/(\d+)$/);
    if (fractionMatch) {
      return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    }

    // Handle decimal format
    const decimal = parseFloat(s);
    if (!isNaN(decimal)) {
      return decimal;
    }

    return null;
  };

  const userDecimal = toDecimal(normalizeAnswer(userAnswer));
  const correctDecimal = toDecimal(normalizeAnswer(correctAnswer));

  if (userDecimal !== null && correctDecimal !== null) {
    // Compare with small tolerance for floating point
    return Math.abs(userDecimal - correctDecimal) < 0.0001;
  }

  return false;
}

/**
 * Check if two answers match
 */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !userAnswer.trim()) {
    return false;
  }

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  // Direct match
  if (normalizedUser === normalizedCorrect) {
    return true;
  }

  // Try fraction/decimal equivalence
  if (fractionEquals(userAnswer, correctAnswer)) {
    return true;
  }

  return false;
}

/**
 * Check all answers in a worksheet submission
 */
export function checkAllAnswers(
  answers: Record<string, string>,
  skipped: Set<string>,
  problems: Problem[]
): WorksheetResults {
  const results: ProblemResult[] = [];
  let totalXp = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  for (const problem of problems) {
    const userAnswer = answers[problem.id] || "";
    const isSkipped = skipped.has(problem.id) || !userAnswer.trim();

    let isCorrect = false;
    let xpEarned = 0;

    if (isSkipped) {
      skippedCount++;
    } else {
      isCorrect = checkAnswer(userAnswer, problem.correctAnswer);
      if (isCorrect) {
        correctCount++;
        xpEarned = problem.xpReward;
        totalXp += xpEarned;
      } else {
        incorrectCount++;
      }
    }

    results.push({
      problemId: problem.id,
      userAnswer,
      correctAnswer: problem.correctAnswer,
      isCorrect,
      isSkipped,
      xpEarned,
    });
  }

  const totalCount = problems.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    results,
    totalXp,
    correctCount,
    incorrectCount,
    skippedCount,
    totalCount,
    percentage,
  };
}

/**
 * Result message types for different outcomes
 */
export type ResultMessageType = "success" | "good" | "okay" | "needs_work" | "all_skipped";

/**
 * Get a friendly message based on results
 */
export function getResultMessage(results: WorksheetResults): {
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  type: ResultMessageType;
} {
  const { percentage, correctCount, skippedCount, totalCount } = results;

  // Handle all-skipped case
  if (skippedCount === totalCount) {
    return {
      title: "Set Completed",
      titleHe: "הסט הושלם",
      message: `You skipped all ${totalCount} questions. Try practicing tomorrow!`,
      messageHe: `דילגת על כל ${totalCount} השאלות. נסה לתרגל מחר!`,
      type: "all_skipped",
    };
  }

  // Handle mostly-skipped case (more than half skipped)
  if (skippedCount > totalCount / 2) {
    const attempted = totalCount - skippedCount;
    return {
      title: "Practice More!",
      titleHe: "תרגל יותר!",
      message: `You only attempted ${attempted} out of ${totalCount} questions. Try to complete more next time!`,
      messageHe: `ניסית רק ${attempted} מתוך ${totalCount} שאלות. נסה להשלים יותר בפעם הבאה!`,
      type: "needs_work",
    };
  }

  if (percentage === 100) {
    return {
      title: "Perfect Score!",
      titleHe: "ציון מושלם!",
      message: `You got all ${totalCount} questions correct!`,
      messageHe: `ענית נכון על כל ${totalCount} השאלות!`,
      type: "success",
    };
  }

  if (percentage >= 80) {
    return {
      title: "Great Job!",
      titleHe: "עבודה מעולה!",
      message: `You got ${correctCount} out of ${totalCount} correct.`,
      messageHe: `ענית נכון על ${correctCount} מתוך ${totalCount} שאלות.`,
      type: "good",
    };
  }

  if (percentage >= 60) {
    return {
      title: "Good Effort!",
      titleHe: "מאמץ טוב!",
      message: `You got ${correctCount} out of ${totalCount} correct. Keep practicing!`,
      messageHe: `ענית נכון על ${correctCount} מתוך ${totalCount} שאלות. המשך לתרגל!`,
      type: "okay",
    };
  }

  return {
    title: "Keep Trying!",
    titleHe: "המשך לנסות!",
    message: `You got ${correctCount} out of ${totalCount} correct. Review the solutions and try again.`,
    messageHe: `ענית נכון על ${correctCount} מתוך ${totalCount} שאלות. עבור על הפתרונות ונסה שוב.`,
    type: "needs_work",
  };
}
