// modules/practice/server/services/daily-generation.service.ts
// AI-powered daily set generation service

import { generateQuestionWithRetry } from "@/modules/ai/server/services/question-generation.service";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import {
  TOPICS,
  getTopicById,
} from "@/modules/skill-tree/config/topics";
import type { Problem, ProblemSlot, DailySetConfig } from "../../types";
import { DEFAULT_DAILY_SET_CONFIG, XP_REWARDS } from "../../types";
import type { Difficulty } from "@/modules/skill-tree/types";
import type { GeneratedQuestion } from "@/modules/ai/types";

/**
 * Result of daily problem generation
 */
export interface DailyGenerationResult {
  problems: Problem[];
  focusTopicId: string;
  focusTopicName: string;
  generatedCount: number;
  fallbackCount: number;
}

/**
 * Generate problems for a user's daily set using AI
 * Uses dynamic slot counts from config (supports 1-10 problems)
 */
export async function generateDailyProblems(
  userId: string,
  focusTopicId: string,
  config: DailySetConfig = DEFAULT_DAILY_SET_CONFIG
): Promise<DailyGenerationResult> {
  const focusTopic = getTopicById(focusTopicId) || TOPICS[0];

  // Select topics for each slot type
  const reviewTopicId = await selectReviewTopic(userId) || TOPICS[0].id;
  const foundationTopicId = selectFoundationTopic(focusTopicId) || TOPICS[0].id;

  let generatedCount = 0;
  let fallbackCount = 0;

  // Build slot configurations dynamically from config
  const slotConfigs: Array<{
    slot: ProblemSlot;
    topicId: string;
    difficulty: Difficulty;
  }> = [];

  // Add review slots (easy, from mastered topics)
  for (let i = 0; i < config.slots.review; i++) {
    slotConfigs.push({ slot: "review", topicId: reviewTopicId, difficulty: "easy" });
  }

  // Add core slots (medium, from focus topic)
  for (let i = 0; i < config.slots.core; i++) {
    slotConfigs.push({ slot: "core", topicId: focusTopicId, difficulty: "medium" });
  }

  // Add foundation slots (easy, from prerequisite topics)
  for (let i = 0; i < config.slots.foundation; i++) {
    slotConfigs.push({ slot: "foundation", topicId: foundationTopicId, difficulty: "easy" });
  }

  // Add challenge slots (hard, from focus topic)
  for (let i = 0; i < config.slots.challenge; i++) {
    slotConfigs.push({ slot: "challenge", topicId: focusTopicId, difficulty: "hard" });
  }

  // Generate all problems in parallel
  const problemPromises = slotConfigs.map(async (slotConfig, index) => {
    try {
      const question = await generateQuestionWithRetry({
        topicId: slotConfig.topicId,
        difficulty: slotConfig.difficulty,
        userId,
      });

      generatedCount++;
      return questionToProblem(question, slotConfig.slot, slotConfig.difficulty, index, slotConfig.topicId);
    } catch {
      fallbackCount++;
      // Return placeholder problem on failure
      return createPlaceholderProblem(slotConfig.topicId, slotConfig.slot, slotConfig.difficulty, index);
    }
  });

  const problems = await Promise.all(problemPromises);

  return {
    problems,
    focusTopicId: focusTopic.id,
    focusTopicName: focusTopic.name,
    generatedCount,
    fallbackCount,
  };
}

/**
 * Convert an AI-generated question to a Problem
 */
function questionToProblem(
  question: GeneratedQuestion,
  slot: ProblemSlot,
  difficulty: Difficulty,
  index: number,
  topicId?: string
): Problem {
  const topic = getTopicById(topicId || "") || TOPICS[0];

  // Find the topic from the question context
  // Since GeneratedQuestion doesn't include topicId, we use the slot config's topic
  return {
    id: `ai_problem_${Date.now()}_${index}`,
    topicId: topic.id,
    topicName: topic.name,
    topicNameHe: topic.nameHe,
    slot,
    difficulty: difficulty,
    questionText: question.questionText,
    questionTextHe: question.questionTextHe,
    questionLatex: extractLatex(question.questionText),
    correctAnswer: question.correctAnswer,
    answerType: question.answerType,
    solutionSteps: question.solutionSteps,
    solutionStepsHe: question.solutionStepsHe,
    hint: question.hint,
    hintHe: question.hintHe,
    estimatedMinutes: question.estimatedMinutes,
    xpReward: XP_REWARDS[difficulty],
  };
}

/**
 * Extract LaTeX expressions from question text (if present)
 */
function extractLatex(text: string): string {
  // Match $...$ or $$...$$ patterns
  const mathMatch = text.match(/\$\$([^$]+)\$\$|\$([^$]+)\$/);
  return mathMatch ? (mathMatch[1] || mathMatch[2] || "") : "";
}

/**
 * Select a review topic - a topic the user has practiced before
 * that hasn't been reviewed in the last few days
 */
async function selectReviewTopic(userId: string): Promise<string | null> {
  try {
    const skillTree = await SkillTreeService.getSkillTreeState(userId);

    // Find topics with some mastery (>30%) that haven't been practiced recently
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - DEFAULT_DAILY_SET_CONFIG.reviewDaysThreshold);

    const reviewCandidates = skillTree.branches
      .flatMap((b) => b.topics)
      .filter((t) => t.mastery >= 30)
      .filter((t) => {
        if (!t.progress?.lastPracticed) return true;
        const lastPracticed = new Date(t.progress.lastPracticed);
        return lastPracticed < threshold;
      })
      .sort((a, b) => {
        // Prioritize topics with lower mastery for review
        return a.mastery - b.mastery;
      });

    if (reviewCandidates.length === 0) {
      // Fallback: any topic with some progress
      const anyProgress = skillTree.branches
        .flatMap((b) => b.topics)
        .filter((t) => t.mastery > 0)
        .sort(() => Math.random() - 0.5); // Random shuffle

      return anyProgress[0]?.id || null;
    }

    return reviewCandidates[0].id;
  } catch {
    return null;
  }
}

/**
 * Select a foundation topic - a prerequisite of the focus topic
 */
function selectFoundationTopic(focusTopicId: string): string | null {
  const topic = getTopicById(focusTopicId);
  if (!topic || topic.prerequisites.length === 0) {
    // If no prerequisites, pick a simpler topic from foundations
    const foundations = TOPICS.filter((t) => t.branchId === "foundations");
    if (foundations.length === 0) return null;
    return foundations[Math.floor(Math.random() * foundations.length)].id;
  }

  // Pick a random prerequisite
  const prereqId = topic.prerequisites[
    Math.floor(Math.random() * topic.prerequisites.length)
  ];
  return prereqId;
}

/**
 * Create a placeholder problem when AI generation fails
 */
function createPlaceholderProblem(
  topicId: string,
  slot: ProblemSlot,
  difficulty: Difficulty,
  index: number
): Problem {
  const topic = getTopicById(topicId) || TOPICS[0];

  const placeholderQuestions: Record<Difficulty, { text: string; textHe: string; answer: string }> = {
    easy: {
      text: `Simplify: 2x + 3x`,
      textHe: `פשט: 2x + 3x`,
      answer: "5x",
    },
    medium: {
      text: `Solve for x: 2x + 5 = 13`,
      textHe: `פתור עבור x: 2x + 5 = 13`,
      answer: "4",
    },
    hard: {
      text: `Factor: x² + 5x + 6`,
      textHe: `פרק לגורמים: x² + 5x + 6`,
      answer: "(x+2)(x+3)",
    },
  };

  const placeholder = placeholderQuestions[difficulty];

  return {
    id: `placeholder_${Date.now()}_${index}`,
    topicId: topic.id,
    topicName: topic.name,
    topicNameHe: topic.nameHe,
    slot,
    difficulty,
    questionText: placeholder.text,
    questionTextHe: placeholder.textHe,
    questionLatex: "",
    correctAnswer: placeholder.answer,
    answerType: "expression" as const,
    solutionSteps: [
      "Step 1: Identify the problem type",
      "Step 2: Apply the appropriate method",
      "Step 3: Simplify and solve",
    ],
    solutionStepsHe: [
      "שלב 1: זהה את סוג הבעיה",
      "שלב 2: החל את השיטה המתאימה",
      "שלב 3: פשט ופתור",
    ],
    hint: `Think about the basic rules of ${topic.name}.`,
    hintHe: `חשוב על הכללים הבסיסיים של ${topic.nameHe}.`,
    estimatedMinutes: difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5,
    xpReward: XP_REWARDS[difficulty],
  };
}

/**
 * Generate problems for a specific topic (topic practice mode)
 */
export async function generateTopicProblems(
  userId: string,
  topicId: string,
  count: number = 5,
  difficulty?: Difficulty
): Promise<Problem[]> {
  const topic = getTopicById(topicId);
  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  // Determine difficulty distribution if not specified
  const difficulties: Difficulty[] = difficulty
    ? Array(count).fill(difficulty)
    : [
        "easy",
        "easy",
        "medium",
        "medium",
        "hard",
      ].slice(0, count) as Difficulty[];

  const problemPromises = difficulties.map(async (diff, index) => {
    try {
      const question = await generateQuestionWithRetry({
        topicId,
        difficulty: diff,
        userId,
      });

      return {
        id: `topic_${Date.now()}_${index}`,
        topicId: topic.id,
        topicName: topic.name,
        topicNameHe: topic.nameHe,
        slot: "core" as ProblemSlot,
        difficulty: diff,
        questionText: question.questionText,
        questionTextHe: question.questionTextHe,
        questionLatex: extractLatex(question.questionText),
        correctAnswer: question.correctAnswer,
        answerType: question.answerType,
        solutionSteps: question.solutionSteps,
        solutionStepsHe: question.solutionStepsHe,
        hint: question.hint,
        hintHe: question.hintHe,
        estimatedMinutes: question.estimatedMinutes,
        xpReward: XP_REWARDS[diff],
      };
    } catch {
      return createPlaceholderProblem(topicId, "core", diff, index);
    }
  });

  return Promise.all(problemPromises);
}
