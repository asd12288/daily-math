// modules/homework/lib/utils.ts
// Utility functions for homework module

import type { HomeworkQuestionWithSolution, QuestionGroup } from "../types";

/**
 * Group questions into hierarchical groups (parent + sub-questions)
 * Used for UI display of physics/math questions with sub-parts
 */
export function groupQuestionsByHierarchy(
  questions: HomeworkQuestionWithSolution[]
): QuestionGroup[] {
  const groups: QuestionGroup[] = [];

  // Collect parent questions and standalone questions
  const parentQuestions = questions.filter((q) => !q.isSubQuestion);
  const subQuestions = questions.filter((q) => q.isSubQuestion);

  // Create groups for each parent question
  for (const parent of parentQuestions) {
    // Find all sub-questions that belong to this parent
    const children = subQuestions
      .filter((sq) => sq.parentQuestionId === parent.$id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    groups.push({
      parentQuestion: parent,
      subQuestions: children,
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
