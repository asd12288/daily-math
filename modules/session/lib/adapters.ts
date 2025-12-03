// modules/session/lib/adapters.ts
// Adapters to convert different question sources to unified SessionQuestion format

import type {
  SessionQuestion,
  SessionSolution,
  SessionQuestionGroup,
  TopicExercise,
  HomeworkQuestionRaw,
  SessionMode,
} from "../types/session.types";
import { calculateQuestionXp } from "../config/constants";

/**
 * Generate a unique ID for session questions
 */
function generateQuestionId(sourceType: string, sourceId: string): string {
  return `${sourceType}-${sourceId}-${Date.now()}`;
}

/**
 * Adapt a topic exercise to SessionQuestion format
 */
export function adaptTopicExercise(
  exercise: TopicExercise,
  mode: SessionMode,
  locale: "en" | "he" = "en"
): SessionQuestion {
  // Build solution - always create if we have at least an answer
  let solution: SessionSolution | null = null;
  const steps = locale === "he" && exercise.solutionStepsHe?.length
    ? exercise.solutionStepsHe
    : exercise.solutionSteps || [];

  const tip = locale === "he" && exercise.tipHe ? exercise.tipHe : exercise.tip;

  // Create solution if we have answer (steps are optional)
  if (exercise.answer) {
    solution = {
      answer: exercise.answer,
      steps: steps.length > 0 ? steps : [], // Empty steps array if none available
      tip,
    };
  }

  return {
    id: generateQuestionId("topic", exercise.$id),
    sourceId: exercise.$id,
    content: exercise.question,
    contentHe: exercise.questionHe,
    difficulty: exercise.difficulty,
    xpReward: calculateQuestionXp(exercise.difficulty, mode),
    estimatedMinutes: exercise.estimatedMinutes,
    isSubQuestion: false,
    solutionStatus: solution ? "loaded" : "pending",
    solution,
    isViewed: false,
  };
}

/**
 * Adapt multiple topic exercises to SessionQuestion array
 */
export function adaptTopicExercises(
  exercises: TopicExercise[],
  mode: SessionMode,
  locale: "en" | "he" = "en"
): SessionQuestion[] {
  return exercises.map((exercise) => adaptTopicExercise(exercise, mode, locale));
}

/**
 * Parse combined solution steps from homework JSON format
 */
function parseHomeworkSolutionSteps(
  stepsJson: string | undefined,
  locale: "en" | "he"
): string[] {
  if (!stepsJson) return [];

  try {
    const parsed = JSON.parse(stepsJson);

    // Check if it's combined format { en: [], he: [] }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (locale === "he" && parsed.he?.length > 0) {
        return parsed.he;
      }
      return parsed.en || [];
    }

    // Fallback: direct array
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch {
    // If parsing fails, treat as single step
    return [stepsJson];
  }
}

/**
 * Adapt a homework question to SessionQuestion format
 */
export function adaptHomeworkQuestion(
  question: HomeworkQuestionRaw,
  mode: SessionMode,
  locale: "en" | "he" = "en"
): SessionQuestion {
  // Build solution if available
  let solution: SessionSolution | null = null;
  let solutionStatus: SessionQuestion["solutionStatus"] = "pending";

  if (question.solutionStatus === "completed" && question.solution) {
    const steps = parseHomeworkSolutionSteps(
      question.solution.solutionSteps,
      locale
    );
    const tip =
      locale === "he" && question.solution.tipHe
        ? question.solution.tipHe
        : question.solution.tip;

    solution = {
      answer: question.answer,
      steps,
      tip,
      aiConfidence: question.aiConfidence,
    };
    solutionStatus = "loaded";
  } else if (question.solutionStatus === "generating") {
    solutionStatus = "loading";
  } else if (question.solutionStatus === "failed") {
    solutionStatus = "error";
  }

  return {
    id: generateQuestionId("homework", question.$id),
    sourceId: question.$id,
    content: question.questionText,
    contentHe: question.questionTextHe,
    difficulty: question.difficulty,
    xpReward: calculateQuestionXp(question.difficulty, mode),
    isSubQuestion: question.isSubQuestion,
    subLabel: question.subQuestionLabel,
    parentId: question.parentQuestionId,
    parentContext: question.parentContext,
    solutionStatus,
    solution,
    isViewed: false,
  };
}

/**
 * Adapt multiple homework questions to SessionQuestion array
 */
export function adaptHomeworkQuestions(
  questions: HomeworkQuestionRaw[],
  mode: SessionMode,
  locale: "en" | "he" = "en"
): SessionQuestion[] {
  return questions.map((q) => adaptHomeworkQuestion(q, mode, locale));
}

/**
 * Group homework questions by parent (for sub-question display)
 */
export function groupHomeworkQuestions(
  questions: SessionQuestion[]
): SessionQuestionGroup[] {
  const groups: Map<string, SessionQuestionGroup> = new Map();
  const standaloneQuestions: SessionQuestion[] = [];

  // First pass: identify parents and standalone questions
  for (const question of questions) {
    if (!question.isSubQuestion && !question.parentId) {
      // Check if this question has sub-questions
      const hasSubQuestions = questions.some(
        (q) => q.parentId === question.sourceId
      );

      if (hasSubQuestions) {
        groups.set(question.sourceId, {
          parent: {
            id: question.id,
            content: question.content,
            contentHe: question.contentHe,
          },
          subQuestions: [],
        });
      } else {
        // Standalone question - treat as its own group
        standaloneQuestions.push(question);
      }
    }
  }

  // Second pass: assign sub-questions to their parents
  for (const question of questions) {
    if (question.isSubQuestion && question.parentId) {
      const group = groups.get(question.parentId);
      if (group) {
        group.subQuestions.push(question);
      } else {
        // Parent not found, treat as standalone
        standaloneQuestions.push(question);
      }
    }
  }

  // Convert standalone questions to single-question groups
  const standaloneGroups: SessionQuestionGroup[] = standaloneQuestions.map(
    (q) => ({
      parent: {
        id: q.id,
        content: q.content,
        contentHe: q.contentHe,
      },
      subQuestions: [q],
    })
  );

  // Combine and sort by original order
  const allGroups = [...groups.values(), ...standaloneGroups];

  // Sort sub-questions within each group by label (a, b, c or 1, 2, 3)
  for (const group of allGroups) {
    group.subQuestions.sort((a, b) => {
      const labelA = a.subLabel || "";
      const labelB = b.subLabel || "";
      return labelA.localeCompare(labelB);
    });
  }

  return allGroups;
}

/**
 * Calculate total potential XP for a session
 */
export function calculateTotalPotentialXp(
  questions: SessionQuestion[]
): number {
  return questions.reduce((sum, q) => sum + q.xpReward, 0);
}

/**
 * Get question counts by difficulty
 */
export function getQuestionCountsByDifficulty(
  questions: SessionQuestion[]
): { easy: number; medium: number; hard: number; total: number } {
  return {
    easy: questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard: questions.filter((q) => q.difficulty === "hard").length,
    total: questions.length,
  };
}

/**
 * Shuffle questions (Fisher-Yates algorithm)
 */
export function shuffleQuestions<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Filter questions by difficulty
 */
export function filterByDifficulty(
  questions: SessionQuestion[],
  difficulty: "easy" | "medium" | "hard" | "all"
): SessionQuestion[] {
  if (difficulty === "all") return questions;
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Select random questions up to a limit
 */
export function selectRandomQuestions(
  questions: SessionQuestion[],
  count: number
): SessionQuestion[] {
  if (questions.length <= count) return questions;
  const shuffled = shuffleQuestions(questions);
  return shuffled.slice(0, count);
}
