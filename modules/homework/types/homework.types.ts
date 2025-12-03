// Homework Module Types

import type { AppwriteDocument } from "@/lib/appwrite/types";

// Homework status enum
export type HomeworkStatus = "uploading" | "processing" | "completed" | "failed";

// Detected language
export type DetectedLanguage = "en" | "he" | "mixed";

// File type category (PDF or image)
export type HomeworkFileType = "pdf" | "image";

// Question types for homework
export type HomeworkQuestionType =
  | "multiple_choice"
  | "open_ended"
  | "proof"
  | "calculation"
  | "word_problem";

// Difficulty levels
export type HomeworkDifficulty = "easy" | "medium" | "hard";

// Original language of the question
export type OriginalLanguage = "en" | "he";

// Solution generation status (for on-demand generation)
export type SolutionStatus = "pending" | "generating" | "completed" | "failed";

// ============================================
// ADAPTIVE AI PROCESSING TYPES
// ============================================

// Question complexity for adaptive processing
export type QuestionComplexity = "simple" | "medium" | "complex";

// Whether a question benefits from visualization
export type VisualizationNeed = "required" | "helpful" | "not_needed";

// Question category for targeted processing
export type QuestionCategory =
  | "calculation"
  | "word_problem"
  | "proof"
  | "graph"
  | "physics_setup"
  | "geometry"
  | "definition";

/**
 * Pre-analysis result from AI classification (lightweight)
 * Used to determine optimal processing strategy
 */
export interface QuestionClassification {
  complexity: QuestionComplexity;
  estimatedSteps: number; // 1-2 for simple, 3-4 for medium, 5-7 for complex
  visualizationNeed: VisualizationNeed;
  visualizationReason?: string; // Why image would help (for targeted prompt)
  questionCategory: QuestionCategory;
  canBatchProcess: boolean; // true for simple standalone questions
}

/**
 * AI suggestions stored on question from classification
 * Used for on-demand UI hints (e.g., "diagram would help")
 */
export interface AISuggestions {
  visualizationNeeded: boolean;
  visualizationReason?: string;
  estimatedSteps: number;
  questionCategory: QuestionCategory;
}

/**
 * Homework Collection
 * Stores metadata about uploaded homework PDFs
 */
export interface Homework extends AppwriteDocument {
  userId: string;
  title: string; // User-provided or auto-generated from filename
  originalFileName: string;
  fileId: string; // Appwrite Storage file ID
  fileSize: number; // File size in bytes
  pageCount: number; // 1-10 pages max (images always = 1)
  fileType: HomeworkFileType; // "pdf" or "image"

  // Processing status
  status: HomeworkStatus;
  errorMessage?: string;

  // Question tracking
  questionCount: number;
  viewedCount: number; // Number of questions with solutions viewed
  xpEarned: number; // Total XP earned from this homework

  // Language detection
  detectedLanguage: DetectedLanguage;

  // Processing timestamps
  processingStartedAt?: string;
  processingCompletedAt?: string;
}

/**
 * Homework Question Collection
 * Individual questions extracted from homework PDFs
 * Note: Solution steps are stored in separate homework_solutions collection
 */
export interface HomeworkQuestion extends AppwriteDocument {
  homeworkId: string;
  userId: string;
  orderIndex: number; // Question order (0-based)
  pageNumber: number; // Which PDF page (1-based)

  // Question content
  questionText: string; // Original text (may include LaTeX)
  questionTextHe?: string; // Hebrew translation if original is English
  originalLanguage: OriginalLanguage;

  // Hierarchical structure (for physics/math questions with main + sub-questions)
  isSubQuestion: boolean; // true if this is a sub-question (a, b, c, etc.)
  parentQuestionId?: string; // Links to parent question's $id
  subQuestionLabel?: string; // "a", "b", "c", "1", "2", etc.
  parentContext?: string; // Cached parent question text (for solving context)

  // Auto-detected classification
  questionType: HomeworkQuestionType;
  detectedSubject: string; // e.g., "Calculus", "Physics", "Linear Algebra"
  detectedTopic?: string; // e.g., "Derivatives", "Kinematics"
  difficulty: HomeworkDifficulty;

  // Answer (final answer only - full solution in homework_solutions)
  answer: string;

  // View tracking
  isViewed: boolean; // Has user viewed the solution?
  viewedAt?: string;
  xpAwarded: number; // 0 or 5 (XP_PER_QUESTION_VIEW)

  // AI metadata
  aiConfidence?: number; // 0-1 confidence score

  // Illustration (optional, AI-generated)
  illustrationFileId?: string; // Appwrite storage file ID
  illustrationUrl?: string; // Public URL for display

  // On-demand solution generation
  solutionStatus?: SolutionStatus; // Track if solution exists (undefined = legacy, has solution)
  aiSuggestions?: string; // JSON string of AISuggestions (from classification)
}

/**
 * Homework Solution Collection
 * Stores detailed solution steps separately from questions
 * Note: solutionSteps stores combined EN/HE format: { en: string[], he: string[] }
 * (Due to Appwrite attribute size limit, we can't add separate solutionStepsHe field)
 */
export interface HomeworkSolution extends AppwriteDocument {
  questionId: string; // Links to HomeworkQuestion.$id
  solutionSteps: string; // JSON with combined format: { en: string[], he: string[] }
  tip?: string;
  tipHe?: string;
}

/**
 * Combined solution steps structure (parsed from solutionSteps JSON)
 */
export interface CombinedSolutionSteps {
  en: string[];
  he: string[];
}

/**
 * Combined question with solution (for display)
 */
export interface HomeworkQuestionWithSolution extends HomeworkQuestion {
  solution?: HomeworkSolution;
}

/**
 * Parsed solution steps (helper type for UI display)
 * @deprecated Use CombinedSolutionSteps instead
 */
export interface ParsedSolutionSteps {
  steps: string[];
  stepsHe: string[];
}

/**
 * Helper function to parse combined solution steps from JSON
 */
export function parseSolutionSteps(solutionStepsJson: string): CombinedSolutionSteps {
  try {
    return JSON.parse(solutionStepsJson) as CombinedSolutionSteps;
  } catch {
    // Fallback for old format (single array) - treat as English only
    try {
      const steps = JSON.parse(solutionStepsJson) as string[];
      return { en: steps, he: [] };
    } catch {
      return { en: [], he: [] };
    }
  }
}

/**
 * Homework with questions (for detail view)
 */
export interface HomeworkWithQuestions extends Homework {
  questions: HomeworkQuestionWithSolution[];
}

/**
 * Grouped question display (parent question with sub-questions)
 * Used for UI rendering of hierarchical questions
 */
export interface QuestionGroup {
  parentQuestion: HomeworkQuestionWithSolution;
  subQuestions: HomeworkQuestionWithSolution[];
}

/**
 * Processing status response
 */
export interface ProcessingStatus {
  status: HomeworkStatus;
  questionCount: number;
  errorMessage?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
}

/**
 * View question response
 */
export interface ViewQuestionResult {
  xpAwarded: number;
  isFirstView: boolean;
  totalXpEarned: number; // Updated total for the homework
}

/**
 * Generate solution on-demand result
 */
export interface GenerateSolutionResult {
  success: boolean;
  solution?: HomeworkSolution;
  xpAwarded: number;
  isFirstView: boolean;
  totalXpEarned: number;
  error?: string;
}

/**
 * Helper function to parse AI suggestions from JSON string
 */
export function parseAISuggestions(suggestionsJson?: string): AISuggestions | null {
  if (!suggestionsJson) return null;
  try {
    return JSON.parse(suggestionsJson) as AISuggestions;
  } catch {
    return null;
  }
}

/**
 * AI extracted question (from PDF processing)
 */
export interface ExtractedQuestion {
  questionText: string;
  pageNumber: number;
  originalLanguage: OriginalLanguage;
  orderIndex: number;
  // Hierarchical structure
  isSubQuestion: boolean;
  subQuestionLabel?: string; // "a", "b", "c", etc.
  parentIndex?: number; // Index of parent question in extraction array
  parentContext?: string; // Filled in after extraction for sub-questions
}

/**
 * Extended extracted question with AI classification
 * Used after pre-analysis phase for adaptive processing
 */
export interface ClassifiedQuestion extends ExtractedQuestion {
  classification: QuestionClassification;
}

/**
 * AI solved question (after solution generation)
 * Note: Both EN and HE solutions are always generated (bilingual)
 */
export interface SolvedQuestion extends ExtractedQuestion {
  questionType: HomeworkQuestionType;
  detectedSubject: string;
  detectedTopic?: string;
  difficulty: HomeworkDifficulty;
  answer: string;
  // English solution
  solutionSteps: string[]; // Array format before JSON stringify
  tip: string;
  // Hebrew solution (always generated)
  solutionStepsHe: string[];
  tipHe: string;
  // Metadata
  aiConfidence: number;
  processingNotes?: string;
  // Extra fields for complex questions (optional)
  keyInsight?: string; // Main takeaway for complex questions
  keyInsightHe?: string;
  commonMistakes?: string[]; // Common errors to avoid
  commonMistakesHe?: string[];
}

/**
 * Grouped questions for batch processing
 */
export interface BatchSolvingResult {
  questions: SolvedQuestion[];
  totalTokensUsed?: number; // For monitoring
}

/**
 * Homework list item (for list view, lighter than full Homework)
 */
export interface HomeworkListItem {
  $id: string;
  title: string;
  originalFileName: string;
  status: HomeworkStatus;
  questionCount: number;
  viewedCount: number;
  xpEarned: number;
  potentialXp: number; // questionCount * XP_PER_QUESTION_VIEW
  detectedLanguage: DetectedLanguage;
  primarySubject?: string; // Most common subject from questions (e.g., "Calculus 1")
  $createdAt: string;
}

/**
 * Filter options for homework list
 */
export type HomeworkDateRange = "all" | "today" | "week" | "month";

/**
 * Filter counts for homework list (used in filter UI)
 */
export interface HomeworkFilterCounts {
  bySubject: Record<string, number>; // e.g., { "Calculus 1": 5, "Physics 1": 3 }
  byStatus: Record<HomeworkStatus | "all", number>;
  byDateRange: Record<HomeworkDateRange, number>;
  total: number;
}

/**
 * Question display item (for UI rendering)
 */
export interface QuestionDisplayItem {
  id: string;
  orderIndex: number;
  pageNumber: number;
  questionText: string; // Localized based on user preference
  questionType: HomeworkQuestionType;
  detectedSubject: string;
  detectedTopic?: string;
  difficulty: HomeworkDifficulty;
  isViewed: boolean;
  xpAwarded: number;
  // Solution (only if viewed)
  answer?: string;
  solutionSteps?: string[]; // Parsed and localized
  tip?: string;
}
