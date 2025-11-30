// modules/courses/types/courses.types.ts
// Type definitions for the courses module

import type { Branch, Topic } from "@/modules/skill-tree/types";

export interface Course {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  // References to skill tree branches
  branchIds: string[];
}

export interface CourseWithProgress extends Course {
  totalTopics: number;
  masteredTopics: number;
  overallProgress: number; // 0-100
  isEnrolled: boolean;
}

/**
 * User settings for a specific course
 * Controls daily practice configuration
 */
export interface CourseSettings {
  courseId: string;
  userId: string;
  // Daily practice settings
  dailyQuestionCount: number; // 1-10 (default: 5)
  // Future settings (placeholders)
  difficulty: "adaptive" | "easy" | "medium" | "hard"; // Default: adaptive
  notificationsEnabled: boolean; // Default: true
  reminderTime?: string; // HH:mm format (e.g., "09:00")
}

/**
 * Default settings for new course enrollments
 */
export const DEFAULT_COURSE_SETTINGS: Omit<CourseSettings, "courseId" | "userId"> = {
  dailyQuestionCount: 5,
  difficulty: "adaptive",
  notificationsEnabled: true,
};

export interface CourseDetailData {
  course: Course;
  branches: Branch[];
  topics: Topic[];
  userProgress: {
    totalTopics: number;
    masteredTopics: number;
    inProgressTopics: number;
    overallProgress: number;
  };
}

// Exercise (question) from the pre-seeded bank
// Matches Appwrite exercises collection schema
export interface Exercise {
  $id: string;
  courseId: string;
  topicId: string;
  // Question content
  question: string;
  questionHe?: string;
  difficulty: "easy" | "medium" | "hard";
  // Answer
  answer?: string;
  answerType: "numeric" | "expression" | "proof" | "open";
  // Hints (tips)
  tip?: string;
  tipHe?: string;
  // XP and timing
  xpReward: number;
  estimatedMinutes?: number;
  // Metadata
  diagramUrl?: string;
  generatedBy?: string;
  generatedAt?: string;
  timesUsed: number;
  averageRating?: number;
}

// Exercise creation input (for seeding)
export interface ExerciseInput {
  courseId: string;
  topicId: string;
  question: string;
  questionHe?: string;
  difficulty: "easy" | "medium" | "hard";
  answer?: string;
  answerType: "numeric" | "expression" | "proof" | "open";
  tip?: string;
  tipHe?: string;
  xpReward: number;
  estimatedMinutes?: number;
}
