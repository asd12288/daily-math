// modules/homework/lib/utils.ts
// Utility functions for homework module

import type { HomeworkQuestionWithSolution, QuestionGroup } from "../types";

/**
 * Group questions into hierarchical groups (parent + sub-questions)
 * Used for UI display of physics/math questions with sub-parts
 *
 * Handles orphaned sub-questions (isSubQuestion=true but no parentQuestionId)
 * by treating them as standalone questions.
 */
export function groupQuestionsByHierarchy(
  questions: HomeworkQuestionWithSolution[]
): QuestionGroup[] {
  const groups: QuestionGroup[] = [];

  // Collect parent questions and standalone questions
  const parentQuestions = questions.filter((q) => !q.isSubQuestion);
  const subQuestions = questions.filter((q) => q.isSubQuestion);

  // Identify orphaned sub-questions (no valid parentQuestionId)
  const parentIds = new Set(parentQuestions.map((p) => p.$id));
  const orphanedSubQuestions = subQuestions.filter(
    (sq) => !sq.parentQuestionId || !parentIds.has(sq.parentQuestionId)
  );
  const linkedSubQuestions = subQuestions.filter(
    (sq) => sq.parentQuestionId && parentIds.has(sq.parentQuestionId)
  );

  // Create groups for each parent question
  for (const parent of parentQuestions) {
    // Find all sub-questions that belong to this parent
    const children = linkedSubQuestions
      .filter((sq) => sq.parentQuestionId === parent.$id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    groups.push({
      parentQuestion: parent,
      subQuestions: children,
    });
  }

  // Treat orphaned sub-questions as standalone parent questions
  for (const orphan of orphanedSubQuestions) {
    groups.push({
      parentQuestion: orphan,
      subQuestions: [],
    });
  }

  // Sort groups by parent question order
  groups.sort((a, b) => a.parentQuestion.orderIndex - b.parentQuestion.orderIndex);

  return groups;
}

/**
 * Count total questions including sub-questions
 */
export function countAllQuestions(groups: QuestionGroup[]): number {
  return groups.reduce(
    (total, group) => total + 1 + group.subQuestions.length,
    0
  );
}

/**
 * Count viewed questions including sub-questions
 */
export function countViewedQuestions(groups: QuestionGroup[]): number {
  return groups.reduce((total, group) => {
    const parentViewed = group.parentQuestion.isViewed ? 1 : 0;
    const subViewed = group.subQuestions.filter((sq) => sq.isViewed).length;
    return total + parentViewed + subViewed;
  }, 0);
}
