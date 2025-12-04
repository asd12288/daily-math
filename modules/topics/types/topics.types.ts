// modules/topics/types/topics.types.ts
// Type definitions for the Topics module

import type { ExerciseDifficulty } from "@/lib/appwrite/types";

/**
 * Branch/category for grouping topics
 */
export interface Branch {
  id: BranchId;
  name: string;
  nameHe: string;
  icon: string;
  color: string;
  order: number;
}

export type BranchId =
  | "foundations"
  | "linear"
  | "polynomials"
  | "quadratics"
  | "functions"
  // Calculus 1 branches
  | "limits"
  | "derivatives-basic"
  | "derivatives-advanced"
  | "applications"
  | "integration";

/**
 * Topic from the database (parsed JSON fields)
 */
export interface TopicDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  courseId: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe?: string;
  branchId: BranchId;
  prerequisites: string[]; // Parsed from JSON
  order: number;
  difficultyLevels: ExerciseDifficulty[]; // Parsed from JSON
  questionTypes?: string[]; // Parsed from JSON
  keywords?: string[]; // Parsed from JSON
  theoryContent?: string;
  theoryContentHe?: string;
  videoIds?: string[]; // Parsed from JSON
  isActive: boolean;
  estimatedMinutes?: number;
}

/**
 * Topic with user stats for display
 */
export interface TopicWithStats extends TopicDocument {
  stats: TopicUserStats;
  questionCount: {
    total: number;
    byDifficulty: Record<ExerciseDifficulty, number>;
    solved: number;
    bookmarked: number;
  };
}

/**
 * User stats for a specific topic
 */
export interface TopicUserStats {
  topicId: string;
  mastery: number; // 0-100
  accuracy: number; // 0-100
  totalTimeSeconds: number;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticedAt: string | null;
}

/**
 * Topic grouped by branch for UI
 */
export interface TopicsByBranch {
  branch: Branch;
  topics: TopicDocument[];
}

/**
 * Topic detail with all related data
 */
export interface TopicDetail extends TopicDocument {
  branch: Branch;
  prerequisiteTopics: TopicDocument[];
  dependentTopics: TopicDocument[];
}

/**
 * Tab types for topic detail page
 */
export type TopicTab = "learn" | "formulas" | "practice" | "videos" | "stats";

/**
 * Input for fetching topic detail
 */
export interface GetTopicDetailInput {
  topicId: string;
  locale?: "en" | "he";
}

/**
 * Input for fetching topics by course
 */
export interface GetTopicsByCourseInput {
  courseId: string;
  includeInactive?: boolean;
}

/**
 * Input for fetching topic stats
 */
export interface GetTopicStatsInput {
  topicId: string;
  userId: string;
}
