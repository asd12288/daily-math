// modules/admin/types/admin.types.ts
// Admin module type definitions

import type { Exercise, ExerciseDifficulty, AnswerType } from "@/lib/appwrite/types";

/**
 * Question filters for admin panel
 */
export interface QuestionFilters {
  courseId?: string;
  topicId?: string;
  difficulty?: ExerciseDifficulty;
  answerType?: AnswerType;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated response for questions list
 */
export interface PaginatedQuestions {
  questions: Exercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Question form data for create/edit
 */
export interface QuestionFormData {
  courseId: string;
  topicId: string;
  question: string;
  questionHe?: string;
  difficulty: ExerciseDifficulty;
  answerType: AnswerType;
  correctAnswer: string;
  solution: string;
  solutionHe?: string;
  hints?: string[];
  hintsHe?: string[];
  tags?: string[];
  estimatedTime?: number;
  isActive?: boolean;
}

/**
 * Admin statistics
 */
export interface AdminStats {
  totalQuestions: number;
  questionsByCourse: Record<string, number>;
  questionsByDifficulty: Record<ExerciseDifficulty, number>;
  activeQuestions: number;
  inactiveQuestions: number;
}

/**
 * Table column configuration for questions list
 */
export interface QuestionTableColumn {
  key: keyof Exercise | "actions";
  label: string;
  sortable?: boolean;
  width?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}
