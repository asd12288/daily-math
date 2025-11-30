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

// Exercise Collection
export interface Exercise extends AppwriteDocument {
  courseId: string;
  topicId: string;

  // Question content (LaTeX supported)
  question: string;
  questionHe?: string;

  // Difficulty
  difficulty: ExerciseDifficulty;
  xpReward: number; // Base XP (modified by difficulty multiplier)

  // Solution content
  solution: string;
  solutionHe?: string;

  // Answer for validation
  correctAnswer: string; // The correct answer
  answerType: AnswerType;

  // Tips/hints - can be an array for multiple hints
  hints?: string[];
  hintsHe?: string[];

  // Tags for categorization
  tags?: string[];

  // Estimated time in minutes
  estimatedTime?: number;

  // Whether this exercise is active (visible to users)
  isActive: boolean;

  // Generated diagram URL (if any)
  diagramUrl?: string;

  // AI generation metadata
  aiGenerated?: boolean;
  generatedBy?: string; // Model name
  generatedAt?: string;

  // Usage tracking
  timesUsed: number;
  averageRating?: number;
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

// Difficulty XP multipliers
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
