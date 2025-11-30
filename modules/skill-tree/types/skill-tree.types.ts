// modules/skill-tree/types/skill-tree.types.ts
// Type definitions for the Skill Tree module

/**
 * Branch - A category grouping related topics
 * e.g., "foundations", "linear", "polynomials", "quadratics", "functions"
 */
export type BranchId =
  | "foundations"
  | "linear"
  | "polynomials"
  | "quadratics"
  | "functions";

export interface Branch {
  id: BranchId;
  name: string;
  nameHe: string;
  icon: string;
  color: string; // Tailwind color class
  order: number;
}

/**
 * Difficulty levels for problems within a topic
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Topic status based on user progress
 * Note: All topics are unlocked from the start - only visual difference
 * - not_started: Never attempted (gray/dim visual)
 * - in_progress: Started but not mastered (partial progress visual)
 * - mastered: Completed (checkmark/green visual)
 */
export type TopicStatus = "not_started" | "in_progress" | "mastered";

/**
 * Topic - An individual skill/concept to learn
 */
export interface Topic {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  branchId: BranchId;
  prerequisites: string[]; // Array of topic IDs
  order: number; // Order within branch
  difficultyLevels: Difficulty[];
  // AI prompt hints for generating questions
  questionTypes: string[];
  keywords: string[];
}

/**
 * User's progress on a specific topic
 */
export interface TopicProgress {
  topicId: string;
  userId: string;
  status: TopicStatus;
  mastery: number; // 0-100
  correctAttempts: number; // Matches Appwrite schema
  totalAttempts: number;
  lastPracticed: string | null; // ISO date
  // Track days practiced for mastery requirement (stored as JSON string in DB)
  daysPracticed: string[]; // Array of ISO dates
}

/**
 * Topic with progress - combined view for UI
 * Note: All topics are always available (canPractice: true)
 */
export interface TopicWithProgress extends Topic {
  progress: TopicProgress | null;
  status: TopicStatus;
  mastery: number;
  canPractice: true; // Always true - all topics unlocked
  // Keep prerequisites for UI display (recommended order)
  hasUnmetPrerequisites: boolean;
  recommendedFirst: string[]; // Topic IDs to consider doing first
}

/**
 * Branch with topics - for rendering the tree
 */
export interface BranchWithTopics extends Branch {
  topics: TopicWithProgress[];
  overallMastery: number; // Average mastery of all topics
  completedCount: number;
  totalCount: number;
}

/**
 * Full skill tree state
 */
export interface SkillTreeState {
  branches: BranchWithTopics[];
  currentFocusTopic: string | null;
  overallProgress: number; // 0-100
  totalMastered: number;
  totalTopics: number;
}

/**
 * Mastery calculation constants
 */
export const MASTERY_CONSTANTS = {
  // Required for mastery
  REQUIRED_CORRECT: 10,
  REQUIRED_ACCURACY: 0.8, // 80%
  REQUIRED_DAYS: 3,
  // Unlock threshold
  UNLOCK_THRESHOLD: 0.5, // 50% mastery to unlock dependent topics
  // Points per correct/incorrect
  POINTS_PER_CORRECT: 10,
  POINTS_PER_INCORRECT: -5,
} as const;

/**
 * Calculate mastery percentage from progress
 */
export function calculateMastery(progress: TopicProgress): number {
  if (progress.totalAttempts === 0) return 0;

  const accuracy = progress.correctAttempts / progress.totalAttempts;
  const correctProgress = Math.min(
    progress.correctAttempts / MASTERY_CONSTANTS.REQUIRED_CORRECT,
    1
  );
  const daysProgress = Math.min(
    progress.daysPracticed.length / MASTERY_CONSTANTS.REQUIRED_DAYS,
    1
  );

  // Weighted average: 50% correct count, 30% accuracy, 20% days spread
  const mastery = correctProgress * 0.5 + accuracy * 0.3 + daysProgress * 0.2;

  return Math.round(mastery * 100);
}

/**
 * Check if topic is mastered
 */
export function isMastered(progress: TopicProgress): boolean {
  const accuracy = progress.correctAttempts / progress.totalAttempts;

  return (
    progress.correctAttempts >= MASTERY_CONSTANTS.REQUIRED_CORRECT &&
    accuracy >= MASTERY_CONSTANTS.REQUIRED_ACCURACY &&
    progress.daysPracticed.length >= MASTERY_CONSTANTS.REQUIRED_DAYS
  );
}

/**
 * Determine topic status based on progress
 * Note: Prerequisites are no longer checked - all topics are always available
 */
export function determineTopicStatus(
  progress: TopicProgress | null
): TopicStatus {
  if (!progress || progress.totalAttempts === 0) return "not_started";
  if (isMastered(progress)) return "mastered";
  return "in_progress";
}

/**
 * Check if prerequisites are met (for UI recommendations only)
 */
export function checkPrerequisitesMet(
  topicPrerequisites: string[],
  allProgress: Map<string, TopicProgress>
): { met: boolean; unmetTopics: string[] } {
  const unmetTopics: string[] = [];

  for (const prereqId of topicPrerequisites) {
    const prereqProgress = allProgress.get(prereqId);
    if (!prereqProgress || !isMastered(prereqProgress)) {
      unmetTopics.push(prereqId);
    }
  }

  return {
    met: unmetTopics.length === 0,
    unmetTopics
  };
}
