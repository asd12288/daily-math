// modules/admin/lib/utils.ts
// Utility functions for admin module

import type { ExerciseDifficulty } from "@/lib/appwrite/types";

/**
 * Get difficulty badge color classes
 */
export function getDifficultyColor(difficulty: ExerciseDifficulty): string {
  switch (difficulty) {
    case "easy":
      return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
    case "medium":
      return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
    case "hard":
      return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

/**
 * Get answer type display label
 */
export function getAnswerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    numeric: "Numeric",
    expression: "Expression",
    proof: "Proof",
    open: "Open-ended",
  };
  return labels[type] || type;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format estimated time
 */
export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Generate a unique ID for new questions
 */
export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parse LaTeX content safely for preview
 */
export function hasLatex(text: string): boolean {
  return /\$[^$]+\$|\\\[[\s\S]+\\\]|\\\([\s\S]+\\\)/.test(text);
}
