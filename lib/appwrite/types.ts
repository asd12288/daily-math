// Appwrite Database Types for DailyMath

import type { Models } from "appwrite";

// User Role type for role-based access control
export type UserRole = "user" | "admin";

// Exercise difficulty type
export type ExerciseDifficulty = "easy" | "medium" | "hard";

// Answer type
export type AnswerType = "numeric" | "expression" | "proof" | "open";

// Base document type with Appwrite fields
export interface AppwriteDocument extends Models.Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// User Profile Collection
export interface UserProfile extends AppwriteDocument {
  userId: string; // Appwrite Auth user ID
  displayName: string;
  email: string;
  avatarUrl?: string;

  // Role-based access control
  role: UserRole; // Default: "user"

  // Gamification
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string; // ISO date string

  // Preferences
  dailyExerciseCount: number; // 1-10
  preferredTime?: string; // HH:mm format
  emailReminders: boolean;
  streakWarnings: boolean;
  weeklyReport: boolean;

  // Integrations
  notionAccessToken?: string;
  notionDatabaseId?: string;

  // Enrolled courses (array of course IDs)
  enrolledCourses: string[];
}

// Course Collection
export interface Course extends AppwriteDocument {
  name: string;
  nameHe: string; // Hebrew name
  description: string;
  descriptionHe: string;
  icon: string; // Emoji or icon name
  color: string; // Hex color for UI

  // Topics within the course
  topics: CourseTopic[];

  // Metadata
  isActive: boolean;
  sortOrder: number;
}

export interface CourseTopic {
  id: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
}

// Exercise Collection - matches actual Appwrite schema
export interface Exercise extends AppwriteDocument {
  courseId: string;
  topicId: string;

  // Question content (LaTeX supported with $ delimiters)
  question: string;
  questionHe?: string;

  // Difficulty and rewards
  difficulty: ExerciseDifficulty;
  xpReward: number; // 10 for easy, 15 for medium, 20 for hard

  // Answer for validation
  answer?: string; // The correct answer
  answerType: AnswerType;

  // Tip/hint (single string, not array)
  tip?: string;
  tipHe?: string;

  // Estimated time in minutes (1-60, default 5)
  estimatedMinutes: number;

  // Whether this exercise is active (visible to users)
  isActive: boolean;

  // Generated diagram URL (if any)
  diagramUrl?: string;

  // AI generation metadata
  generatedBy?: string; // Model name (e.g., "gemini-2.0-flash")
  generatedAt?: string;

  // Usage tracking
  timesUsed: number;
  averageRating?: number; // 0-5 scale
}

/**
 * Extended Exercise type for Admin UI
 * Combines Exercise with ExerciseSolution data and form-friendly field names
 * Used in admin forms and preview components
 */
export interface AdminExercise extends Exercise {
  // Form-friendly aliases for UI
  correctAnswer?: string; // Alias for `answer`
  estimatedTime?: number; // Alias for `estimatedMinutes`

  // Solution data (from exercise_solutions table)
  solution?: string;
  solutionHe?: string;

  // Hints as array (for form array fields, converted from tip)
  hints?: string[];
  hintsHe?: string[];

  // Tags for categorization
  tags?: string[];
}

// Exercise Solution Collection - separate table for solution steps
export interface ExerciseSolution extends AppwriteDocument {
  exerciseId: string;

  // Full solution explanation
  solution: string;

  // Step-by-step solution (stored as JSON string in DB)
  steps?: string; // JSON array of steps
  stepsHe?: string; // JSON array of Hebrew steps
}

// Helper type for parsed solution steps
export interface ParsedExerciseSolution {
  exerciseId: string;
  solution: string;
  steps: string[];
  stepsHe: string[];
}

// Daily Set Collection
export interface DailySet extends AppwriteDocument {
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)

  // Exercises for this day
  exercises: DailySetExercise[];

  // Completion tracking
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
  completedAt?: string;

  // XP earned
  xpEarned: number;

  // Email sent status
  reminderSent: boolean;
  warningSent: boolean;

  // Notion sync
  notionPageId?: string;
}

export interface DailySetExercise {
  exerciseId: string;
  status: "pending" | "completed" | "skipped";
  completedAt?: string;
  xpAwarded?: number;
}

// User Answer Collection
export interface UserAnswer extends AppwriteDocument {
  userId: string;
  exerciseId: string;
  dailySetId: string;

  // Answer details
  answerType: "self_mark" | "image_upload" | "text_input";

  // For text/numeric answers
  textAnswer?: string;

  // For image uploads
  imageFileId?: string;
  imageAnalysis?: ImageAnalysisResult;

  // Result
  isCorrect?: boolean;
  selfMarked: boolean;

  // XP
  xpAwarded: number;

  // Timing
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
}

export interface ImageAnalysisResult {
  confidence: number; // 0-1
  isCorrect: boolean;
  feedback: string;
  feedbackHe?: string;
  analyzedAt: string;
}

// XP Level Configuration (not a collection, just constants)
export const XP_LEVELS = [
  { level: 1, title: "Beginner", titleHe: "מתחיל", xpRequired: 0 },
  { level: 2, title: "Student", titleHe: "תלמיד", xpRequired: 100 },
  { level: 3, title: "Learner", titleHe: "לומד", xpRequired: 300 },
  { level: 4, title: "Practitioner", titleHe: "מתרגל", xpRequired: 600 },
  { level: 5, title: "Scholar", titleHe: "חוקר", xpRequired: 1000 },
  { level: 6, title: "Expert", titleHe: "מומחה", xpRequired: 1500 },
  { level: 7, title: "Master", titleHe: "אמן", xpRequired: 2500 },
  { level: 8, title: "Grandmaster", titleHe: "אמן על", xpRequired: 4000 },
  { level: 9, title: "Legend", titleHe: "אגדה", xpRequired: 6000 },
  { level: 10, title: "Sage", titleHe: "חכם", xpRequired: 10000 },
] as const;

// XP rewards per difficulty level
export const XP_REWARDS: Record<ExerciseDifficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 20,
} as const;

// Difficulty XP multipliers (for bonus calculations)
export const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2,
} as const;

// Base XP values
export const BASE_XP = {
  exerciseCompletion: 10,
  dailySetCompletion: 25,
  streakBonus: 5, // Per day in streak
  perfectDayBonus: 15, // All exercises correct
} as const;

// Helper function to get XP reward for a difficulty
export function getXpReward(difficulty: ExerciseDifficulty): number {
  return XP_REWARDS[difficulty];
}

// ============================================
// Topic-Centric Learning Types
// ============================================

// Topic Collection - Individual study topics within a course
export interface Topic extends AppwriteDocument {
  courseId: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe?: string;
  branchId: string; // Branch/category ID
  prerequisites: string[]; // JSON string stored, parsed as array of topic IDs
  order: number; // Display order within branch
  difficultyLevels: ExerciseDifficulty[]; // JSON string stored, parsed as array
  questionTypes?: string[]; // JSON string stored, for AI prompt hints
  keywords?: string[]; // JSON string stored, for search
  theoryContent?: string; // Markdown content for Learn tab
  theoryContentHe?: string; // Hebrew theory content
  videoIds?: string[]; // JSON string stored, YouTube video IDs
  isActive: boolean;
  estimatedMinutes?: number; // Time to learn (5-120)
}

// Topic with user stats for UI display
export interface TopicWithStats extends Topic {
  stats: TopicUserStats;
  formulas: TopicFormula[];
  questionCount: {
    total: number;
    byDifficulty: Record<ExerciseDifficulty, number>;
    solved: number;
    bookmarked: number;
  };
}

// User stats for a specific topic
export interface TopicUserStats {
  topicId: string;
  userId: string;
  mastery: number; // 0-100
  accuracy: number; // 0-100
  totalTimeSeconds: number;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticedAt: string | null;
  questionHistory: QuestionHistoryEntry[];
}

// Entry in question history
export interface QuestionHistoryEntry {
  exerciseId: string;
  answeredAt: string;
  isCorrect: boolean;
  timeSeconds: number;
}

// Topic Formula Collection - Formulas/equations for a topic
export interface TopicFormula extends AppwriteDocument {
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  latex: string; // LaTeX formula content
  explanation?: string; // When/how to use
  explanationHe?: string;
  category?: string; // e.g., "derivatives", "limits"
  sortOrder: number;
  tags?: string[]; // JSON string stored
  isCore: boolean; // Mark essential formulas
}

// Formula grouped by category for UI display
export interface FormulaGroup {
  category: string;
  formulas: TopicFormula[];
}

// ============================================
// Topic Video Types
// ============================================

// Video language type
export type VideoLanguage = "en" | "he" | "other";

// Video source type
export type VideoSource = "curated" | "api";

// Topic Video Collection - YouTube tutorials linked to topics
export interface TopicVideo extends AppwriteDocument {
  videoId: string; // YouTube video ID (e.g., "dQw4w9WgXcQ")
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string; // Human-readable format "12:34"
  durationSeconds?: number;
  language: VideoLanguage;
  sortOrder: number;
  source: VideoSource;
  description?: string;
  isActive: boolean;
}

// Videos grouped by language for UI display
export interface VideosByLanguage {
  language: VideoLanguage;
  languageLabel: string;
  videos: TopicVideo[];
}

// Tab types for topic detail page
export type TopicTab = "learn" | "formulas" | "practice" | "videos" | "stats";
