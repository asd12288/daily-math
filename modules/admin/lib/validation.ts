// modules/admin/lib/validation.ts
// Zod validation schemas for admin module

import { z } from "zod";

/**
 * Schema for question filters
 */
export const questionFiltersSchema = z.object({
  courseId: z.string().optional(),
  topicId: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  answerType: z.enum(["numeric", "expression", "proof", "open"]).optional(),
  search: z.string().max(256).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Schema for creating/updating a question
 */
export const questionFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  topicId: z.string().min(1, "Topic is required"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  questionHe: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answerType: z.enum(["numeric", "expression", "proof", "open"]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  solutionHe: z.string().optional(),
  hints: z.array(z.string()).max(5).optional(),
  hintsHe: z.array(z.string()).max(5).optional(),
  tags: z.array(z.string()).max(10).optional(),
  estimatedTime: z.number().int().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for question ID parameter
 */
export const questionIdSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
});

/**
 * Schema for bulk operations
 */
export const bulkOperationSchema = z.object({
  questionIds: z.array(z.string()).min(1, "At least one question ID is required"),
  operation: z.enum(["activate", "deactivate", "delete"]),
});

// Type exports inferred from schemas
export type QuestionFiltersInput = z.infer<typeof questionFiltersSchema>;
export type QuestionFormInput = z.infer<typeof questionFormSchema>;
export type QuestionIdInput = z.infer<typeof questionIdSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
